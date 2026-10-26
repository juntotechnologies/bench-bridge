/** Fit check: opens the built site at many window sizes and fails when the page scrolls or a region is clipped. */
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Browser, type Locator, type Page } from "@playwright/test"
import { z } from "zod"
import fitJson from "./fit.json" with { type: "json" }
import { serveSite } from "./staticSite"

const Viewport = z.object({ name: z.string(), width: z.number(), height: z.number() })
type Viewport = z.infer<typeof Viewport>

const Fit = z.object({
  siteConfig: z.string(),
  outDir: z.string(),
  viewports: z.array(Viewport),
  regions: z.array(z.string()),
  sheetSelector: z.string(),
  contained: z.array(z.tuple([z.string(), z.string()])),
  truncated: z.array(z.string()),
  tabs: z.array(z.string()),
  readySelector: z.string(),
  runSelector: z.string(),
  navSelector: z.string(),
  runMs: z.number(),
  minSheetHeight: z.number(),
})
type Fit = z.infer<typeof Fit>

const fit = Fit.parse(fitJson)
const OVERFLOW = "Math.max(document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth)"

interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface Measure {
  pageOverflow: number
  clipped: string[]
  escaped: string[]
  cutOff: string[]
  sheetHeight: number
}

function isOutside(viewport: Viewport, box: Box): boolean {
  return box.y + box.height > viewport.height + 1 || box.x + box.width > viewport.width + 1 || box.y < -1 || box.x < -1
}

function boxOf(handle: Locator): Promise<Box | null> {
  return handle.boundingBox()
}

function isBox(box: Box | null): box is Box {
  return box !== null
}

/** Boxes of the visible elements that match; hidden elements have no box. */
async function boxesOf(page: Page, selector: string): Promise<Box[]> {
  const handles = await page.locator(selector).all()
  return (await Promise.all(handles.map(boxOf))).filter(isBox)
}

async function isClipped(page: Page, viewport: Viewport, selector: string): Promise<boolean> {
  return (await boxesOf(page, selector)).some(isOutside.bind(null, viewport))
}

async function clippedRegions(page: Page, viewport: Viewport): Promise<string[]> {
  const flags = await Promise.all(fit.regions.map(isClipped.bind(null, page, viewport)))
  return fit.regions.filter(isFlagged.bind(null, flags))
}

function isFlagged(flags: boolean[], _item: unknown, index: number): boolean {
  return flags[index] === true
}

/** True when a visible element of the first selector sticks out of its closest ancestor of the second. */
async function hasEscaped(page: Page, pair: [string, string]): Promise<boolean> {
  const [child, parent] = pair
  const script = `[...document.querySelectorAll(${JSON.stringify(child)})].some(e => {
    const p = e.closest(${JSON.stringify(parent)})
    if (!p || e.offsetParent === null) return false
    const a = e.getBoundingClientRect(), b = p.getBoundingClientRect()
    return a.right > b.right + 1 || a.left < b.left - 1 || a.bottom > b.bottom + 1 || a.top < b.top - 1
  })`
  return (await page.evaluate(script)) as boolean
}

async function escapedPairs(page: Page): Promise<string[]> {
  const flags = await Promise.all(fit.contained.map(hasEscaped.bind(null, page)))
  return fit.contained.filter(isFlagged.bind(null, flags)).map(describePair)
}

function describePair(pair: [string, string]): string {
  return `${pair[0]} leaves ${pair[1]}`
}

/** True when any visible element of the selector holds more text than it shows. */
async function isTextCut(page: Page, selector: string): Promise<boolean> {
  const script = `[...document.querySelectorAll(${JSON.stringify(selector)})].some(e => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 1)`
  return (await page.evaluate(script)) as boolean
}

async function cutOffText(page: Page): Promise<string[]> {
  const flags = await Promise.all(fit.truncated.map(isTextCut.bind(null, page)))
  return fit.truncated.filter(isFlagged.bind(null, flags))
}

async function measure(page: Page, viewport: Viewport): Promise<Measure> {
  const sheet = (await boxesOf(page, fit.sheetSelector))[0]
  const pageOverflow = (await page.evaluate(OVERFLOW)) as number
  return { pageOverflow, clipped: await clippedRegions(page, viewport), escaped: await escapedPairs(page), cutOff: await cutOffText(page), sheetHeight: sheet?.height ?? 0 }
}

function overflowProblem(step: string, found: Measure): string | null {
  return found.pageOverflow > 0 ? `${step}: page overflows by ${found.pageOverflow}px` : null
}

function clipProblem(step: string, found: Measure): string | null {
  return found.clipped.length ? `${step}: outside the window: ${found.clipped.join(", ")}` : null
}

function escapeProblem(step: string, found: Measure): string | null {
  return found.escaped.length ? `${step}: ${found.escaped.join(", ")}` : null
}

function cutProblem(step: string, found: Measure): string | null {
  return found.cutOff.length ? `${step}: text cut off in ${found.cutOff.join(", ")}` : null
}

function sheetProblem(step: string, found: Measure): string | null {
  const small = found.sheetHeight > 0 && found.sheetHeight < fit.minSheetHeight
  return small ? `${step}: drawing only ${Math.round(found.sheetHeight)}px tall` : null
}

function problemsOf(step: string, found: Measure): string[] {
  return [overflowProblem(step, found), clipProblem(step, found), escapeProblem(step, found), cutProblem(step, found), sheetProblem(step, found)].filter(isString)
}

async function check(page: Page, viewport: Viewport, step: string): Promise<string[]> {
  await page.waitForTimeout(150)
  return problemsOf(step, await measure(page, viewport))
}

async function paneIfVisible(button: Locator): Promise<string | null> {
  return (await button.isVisible()) ? button.getAttribute("data-pane") : null
}

function isString(value: string | null): value is string {
  return value !== null
}

/** The pane names of the nav buttons that are on screen. */
async function visiblePanes(page: Page): Promise<string[]> {
  const buttons = await page.locator(fit.navSelector).all()
  return (await Promise.all(buttons.map(paneIfVisible))).filter(isString)
}

async function walkPanes(page: Page, viewport: Viewport): Promise<string[]> {
  const problems: string[] = []
  for (const pane of await visiblePanes(page)) {
    await page.click(`${fit.navSelector}[data-pane="${pane}"]`)
    problems.push(...(await check(page, viewport, `pane ${pane}`)))
  }
  return problems
}

async function walkRun(page: Page, viewport: Viewport): Promise<string[]> {
  await page.click(fit.runSelector)
  await page.waitForTimeout(fit.runMs)
  const problems: string[] = []
  for (const tab of fit.tabs) {
    await page.click(`[data-tab="${tab}"]`)
    problems.push(...(await check(page, viewport, `tab ${tab}`)))
  }
  return problems
}

function labelled(viewport: Viewport, problem: string): string {
  return `${viewport.name} ${viewport.width}x${viewport.height} ${problem}`
}

async function walkViewport(browser: Browser, url: string, viewport: Viewport): Promise<string[]> {
  const page = await browser.newPage({ viewport })
  await page.goto(url)
  await page.waitForSelector(fit.readySelector)
  const loaded = await check(page, viewport, "load")
  await page.screenshot({ path: join(fit.outDir, `${viewport.name}-load.png`) })
  const problems = [...loaded, ...(await walkPanes(page, viewport)), ...(await walkRun(page, viewport))]
  await page.screenshot({ path: join(fit.outDir, `${viewport.name}-run.png`) })
  await page.close()
  return problems.map(labelled.bind(null, viewport))
}

function report(problem: string): void {
  console.error(problem)
}

async function main(): Promise<void> {
  mkdirSync(fit.outDir, { recursive: true })
  const { server, url } = await serveSite(fit.siteConfig)
  const browser = await chromium.launch()
  const problems: string[] = []
  for (const viewport of fit.viewports) problems.push(...(await walkViewport(browser, url, viewport)))
  await browser.close()
  await server.close()
  problems.forEach(report)
  console.log(problems.length ? `${problems.length} fit problems` : `fit ok at ${fit.viewports.length} sizes`)
  process.exitCode = problems.length ? 1 : 0
}

await main()

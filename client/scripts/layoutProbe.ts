/** Layout probe: measures boxes and heading lines in the open page, then lists what breaks the layout budget. */
import type { Page } from "@playwright/test"
import { z } from "zod"
import layoutJson from "@design/layout.json" with { type: "json" }
import tokensJson from "@design/tokens.json" with { type: "json" }
import { hasUnevenRow, lopsided, overlong, undersized, type Box } from "./layoutBudget"

export const LayoutConfig = z.object({
  rows: z.array(z.string()),
  frames: z.array(z.string()),
  compactFrames: z.array(z.string()),
  headings: z.array(z.string()),
  headingLines: z.number(),
  tolerance: z.number(),
})
export type LayoutConfig = z.infer<typeof LayoutConfig>

/** What the page reports: the visible boxes of each selector, and the line count of each heading. */
interface Probe {
  boxes: Record<string, Box[]>
  lines: Record<string, number[]>
}

interface Windowed {
  width: number
  compact: boolean
}

const TAP_MIN = Number.parseFloat(tokensJson.size.touch.value)
const COMPACT_BELOW = layoutJson.compactBelow.value

/** Page script. It is a string so no function nests inside another. A hidden element has no box and is skipped. */
const PROBE = `(spec) => {
  const shown = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"
  const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height } }
  const all = (selector) => [...document.querySelectorAll(selector)].filter(shown)
  const lines = (e) => { const r = document.createRange(); r.selectNodeContents(e.firstChild ?? e); return new Set([...r.getClientRects()].map((b) => Math.round(b.top))).size }
  const boxes = {}, counts = {}
  for (const s of spec.boxes) boxes[s] = all(s).map(box)
  for (const s of spec.headings) counts[s] = all(s).map(lines)
  return { boxes, lines: counts }
}`

function selectorsToBox(layout: LayoutConfig, tapped: string[]): string[] {
  return [...new Set([...tapped, ...layout.rows, ...layout.frames, ...layout.compactFrames])]
}

async function probe(page: Page, layout: LayoutConfig, tapped: string[]): Promise<Probe> {
  const spec = { boxes: selectorsToBox(layout, tapped), headings: layout.headings }
  return (await page.evaluate(`(${PROBE})(${JSON.stringify(spec)})`)) as Probe
}

function boxesOf(found: Probe, selector: string): Box[] {
  return found.boxes[selector] ?? []
}

function tapProblem(found: Probe, selector: string): string | null {
  const small = undersized(boxesOf(found, selector), TAP_MIN)
  return small.length ? `${selector} is under ${TAP_MIN}px: ${small.map(sizeOf).join(", ")}` : null
}

function sizeOf(box: Box): string {
  return `${Math.round(box.width)}x${Math.round(box.height)}`
}

function rowProblem(layout: LayoutConfig, found: Probe, selector: string): string | null {
  return hasUnevenRow(boxesOf(found, selector), layout.tolerance) ? `${selector} differ in width within one row` : null
}

function marginProblem(layout: LayoutConfig, window: Windowed, found: Probe, selector: string): string | null {
  const off = lopsided(boxesOf(found, selector), window.width, layout.tolerance)
  return off.length ? `${selector} has unequal side margins` : null
}

function headingProblem(layout: LayoutConfig, found: Probe, selector: string): string | null {
  const long = overlong(found.lines[selector] ?? [], layout.headingLines)
  return long.length ? `${selector} runs to ${Math.max(...long)} lines, over ${layout.headingLines}` : null
}

function isString(value: string | null): value is string {
  return value !== null
}

function tapProblems(window: Windowed, tapped: string[], found: Probe): (string | null)[] {
  return window.compact ? tapped.map(tapProblem.bind(null, found)) : []
}

function frameProblems(window: Windowed, layout: LayoutConfig, found: Probe): (string | null)[] {
  const frames = window.compact ? [...layout.frames, ...layout.compactFrames] : layout.frames
  return frames.map(marginProblem.bind(null, layout, window, found))
}

/** Every layout problem in the open page at the current window width. */
export async function layoutProblems(page: Page, layout: LayoutConfig, tapped: string[], width: number): Promise<string[]> {
  const window: Windowed = { width, compact: width < COMPACT_BELOW }
  const found = await probe(page, layout, tapped)
  const rows = layout.rows.map(rowProblem.bind(null, layout, found))
  const headings = layout.headings.map(headingProblem.bind(null, layout, found))
  return [...tapProblems(window, tapped, found), ...rows, ...frameProblems(window, layout, found), ...headings].filter(isString)
}

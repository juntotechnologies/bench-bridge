/** Proof script: renders every instrument drawing and every kit drawing to SVG and PNG, and fails when a model is missing. */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Page } from "@playwright/test"
import tokens from "@design/tokens.json" with { type: "json" }
import { devices, kits, type Identified } from "@shared/registry"
import { drawById } from "../drawings/draw"
import { kitDrawingId } from "../drawings/ids"
import type { DrawOptions } from "../drawings/draw"

const OUT = "proof"
const { ink, accent, raised } = tokens.color
const STYLE = `path{fill:none;stroke:${ink.value};stroke-linejoin:round;stroke-linecap:round}
[data-line-role=outline]{stroke-width:.35}[data-line-role=edge]{stroke-width:.22}[data-line-role=detail]{stroke-width:.13}
[data-line-role=axis]{stroke-dasharray:6 1 1 1;stroke-width:.13}[data-item=bridge] path{stroke:${accent.value}}
[data-ink-fill]{fill:${ink.value}}text{font:3.2px monospace;letter-spacing:.3px}`

const VIEWS: Record<string, DrawOptions> = {
  exploded: { explosion: 1, fitExplosion: 1, annotate: true },
  assembled: { explosion: 0, fitExplosion: 1 },
}

function sheet(markup: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="1680" height="1188"><style>${STYLE}</style><rect width="420" height="297" fill="${raised.value}"/>${markup}</svg>`
}

async function proofDrawing(page: Page, id: string): Promise<void> {
  for (const [view, options] of Object.entries(VIEWS)) {
    const file = join(OUT, `${id.replace(":", "-")}-${view}`)
    writeFileSync(`${file}.svg`, sheet(drawById(id, options).markup))
    await page.goto(`file://${process.cwd()}/${file}.svg`)
    await page.screenshot({ path: `${file}.png` })
  }
}

/** Every drawing ID: each instrument, then each bridge kit. */
function drawingIds(): string[] {
  return [...devices.map(identifier), ...kits.map(kitKey)]
}

function identifier(item: Identified): string {
  return item.id
}

function kitKey(kit: Identified): string {
  return kitDrawingId(kit.id)
}

async function main(only: string | undefined): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1680, height: 1188 } })
  for (const id of drawingIds().filter(matches.bind(null, only))) await proofDrawing(page, id)
  await browser.close()
}

function matches(only: string | undefined, id: string): boolean {
  return !only || id === only
}

await main(process.argv[2])

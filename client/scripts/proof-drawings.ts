import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Page } from "@playwright/test"
import { devices } from "@shared/registry"
import { drawDevice } from "../drawings/draw"
import type { Device } from "@shared/registry/schema"
import type { DrawOptions } from "../drawings/draw"

const OUT = "proof"
const STYLE = `path{fill:none;stroke:#1c1b19;stroke-linejoin:round;stroke-linecap:round}
[data-line-role=outline]{stroke-width:.35}[data-line-role=edge]{stroke-width:.22}[data-line-role=detail]{stroke-width:.13}
[data-line-role=axis]{stroke-dasharray:6 1 1 1;stroke-width:.13}[data-item=bridge] path{stroke:#e8590c}
[data-ink-fill]{fill:#1c1b19}text{font:3.2px monospace;letter-spacing:.3px}`

const VIEWS: Record<string, DrawOptions> = {
  exploded: { explosion: 1, fitExplosion: 1, annotate: true },
  assembled: { explosion: 0, fitExplosion: 1 },
}

function sheet(markup: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="1680" height="1188"><style>${STYLE}</style><rect width="420" height="297" fill="#fff"/>${markup}</svg>`
}

async function proofDevice(page: Page, device: Device): Promise<void> {
  for (const [view, options] of Object.entries(VIEWS)) {
    const file = join(OUT, `${device.id}-${view}`)
    writeFileSync(`${file}.svg`, sheet(drawDevice(device, options).markup))
    await page.goto(`file://${process.cwd()}/${file}.svg`)
    await page.screenshot({ path: `${file}.png` })
  }
}

async function main(only: string | undefined): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1680, height: 1188 } })
  for (const device of devices.filter(matches.bind(null, only))) await proofDevice(page, device)
  await browser.close()
}

function matches(only: string | undefined, device: Device): boolean {
  return !only || device.id === only
}

await main(process.argv[2])

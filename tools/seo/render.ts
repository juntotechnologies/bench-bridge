/** Draws pages to PNG with Chromium. This is the one module that starts a browser. */
import { chromium, type Browser } from "@playwright/test"
import type { RenderJob } from "./images"

const FONTS_READY = "document.fonts.ready.then(() => 'ready')"

async function drawOne(browser: Browser, job: RenderJob): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: job.width, height: job.height } })
  await page.setContent(job.html, { waitUntil: "load" })
  await page.evaluate(FONTS_READY)
  const png = await page.screenshot({ type: "png" })
  await page.close()
  return png
}

async function drawAll(browser: Browser, jobs: RenderJob[]): Promise<Buffer[]> {
  const pngs: Buffer[] = []
  for (const job of jobs) pngs.push(await drawOne(browser, job))
  return pngs
}

/** One PNG for each job, in order. */
export async function drawPages(jobs: RenderJob[]): Promise<Buffer[]> {
  const browser = await chromium.launch()
  try {
    return await drawAll(browser, jobs)
  } finally {
    await browser.close()
  }
}

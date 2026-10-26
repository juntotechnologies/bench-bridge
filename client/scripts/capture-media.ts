/** Media script: records the built static site into the README screenshot and an animated GIF. */
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium, type BrowserContext, type Page } from "@playwright/test"
import { z } from "zod"
import mediaJson from "./media.json" with { type: "json" }
import { serveSite } from "./staticSite"

const Size = z.object({ width: z.number(), height: z.number() })
const Media = z.object({
  siteConfig: z.string(),
  outDir: z.string(),
  screenshot: z.string(),
  animation: z.string(),
  viewport: Size,
  video: Size,
  gif: z.object({ fps: z.number(), width: z.number() }),
  readySelector: z.string(),
  runSelector: z.string(),
  settleMs: z.number(),
  runMs: z.number(),
  holdMs: z.number(),
})
type Media = z.infer<typeof Media>

const media = Media.parse(mediaJson)

/** The ffmpeg arguments that turn the recorded video into a looping GIF with its own palette. */
function ffmpegArgs(input: string, output: string, settings: Media): string[] {
  const { fps, width } = settings.gif
  const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`
  return ["-y", "-loglevel", "error", "-i", input, "-vf", filter, "-loop", "0", output]
}

async function playRun(page: Page, settings: Media): Promise<void> {
  await page.waitForSelector(settings.readySelector)
  await page.waitForTimeout(settings.settleMs)
  await page.click(settings.runSelector)
  await page.waitForTimeout(settings.runMs)
  await page.screenshot({ path: join(settings.outDir, settings.screenshot) })
  await page.waitForTimeout(settings.holdMs)
}

async function record(context: BrowserContext, url: string, settings: Media): Promise<string> {
  const page = await context.newPage()
  await page.goto(url)
  await playRun(page, settings)
  const video = page.video()
  await context.close()
  return (await video?.path()) ?? ""
}

async function capture(url: string, scratch: string, settings: Media): Promise<string> {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: settings.viewport, recordVideo: { dir: scratch, size: settings.video } })
  const video = await record(context, url, settings)
  await browser.close()
  return video
}

async function main(): Promise<void> {
  mkdirSync(media.outDir, { recursive: true })
  const scratch = mkdtempSync(join(tmpdir(), "bench-bridge-media-"))
  const { server, url } = await serveSite(media.siteConfig)
  const video = await capture(url, scratch, media)
  await server.close()
  execFileSync("ffmpeg", ffmpegArgs(video, join(media.outDir, media.animation), media))
  rmSync(scratch, { recursive: true })
}

await main()

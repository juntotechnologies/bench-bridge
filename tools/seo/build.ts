/** SEO build: writes the discovery files, icons and home page tags from site/seo.json, or fails with --check when any is stale. */
import { localDay } from "./git"
import { renderJob, type ImagePlan } from "./images"
import { imagePath, staleImages, staleTexts, textPath, writeImages, writeText } from "./io"
import { readPlan, type Plan } from "./plan"

const ROOT = process.cwd()

function report(path: string): void {
  console.error(`${path} is stale: run npm run seo`)
}

function check(plan: Plan): number {
  const stale = [...staleTexts(ROOT, plan.texts).map(textPath), ...staleImages(ROOT, plan.images).map(imagePath)]
  stale.forEach(report)
  return stale.length ? 1 : 0
}

async function drawStale(plan: Plan, stale: ImagePlan[]): Promise<void> {
  const { drawPages } = await import("./render")
  const pngs = await drawPages(stale.map(renderJob.bind(null, plan.site, plan.drawParts)))
  writeImages(ROOT, stale, pngs)
}

async function write(plan: Plan): Promise<number> {
  plan.texts.forEach(writeText.bind(null, ROOT))
  const stale = staleImages(ROOT, plan.images)
  if (stale.length) await drawStale(plan, stale)
  console.log(`seo files written: ${plan.texts.length} text, ${stale.length} images redrawn`)
  return 0
}

async function main(argv: string[]): Promise<number> {
  const plan = readPlan(ROOT, localDay(new Date()))
  return argv.includes("--check") ? check(plan) : write(plan)
}

process.exitCode = await main(process.argv.slice(2))

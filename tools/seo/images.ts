/** Plans each image: the hash of its page source, whether the file on disk is current, and the job that redraws it. */
import type { ImageSpec } from "./files"
import type { HtmlParts } from "./og"
import { SOURCE_KEY, embedText, isComplete, readSize, readText, sha256 } from "./png"
import type { Site } from "./site"

export interface ImagePlan {
  spec: ImageSpec
  hash: string
}

export interface RenderJob {
  html: string
  width: number
  height: number
}

/** The hash comes from the page built with asset hashes, so it needs no browser and no big file. */
export function planImage(site: Site, hashParts: HtmlParts, spec: ImageSpec): ImagePlan {
  return { spec, hash: sha256(spec.html(site, hashParts)) }
}

export function isCurrent(png: Buffer | null, plan: ImagePlan): boolean {
  if (!png || !isComplete(png)) return false
  const size = readSize(png)
  return readText(png, SOURCE_KEY) === plan.hash && size.width === plan.spec.width && size.height === plan.spec.height
}

export function renderJob(site: Site, drawParts: HtmlParts, plan: ImagePlan): RenderJob {
  return { html: plan.spec.html(site, drawParts), width: plan.spec.width, height: plan.spec.height }
}

/** The drawn image with the hash of its source added. */
export function stamp(png: Buffer, plan: ImagePlan): Buffer {
  return embedText(png, SOURCE_KEY, plan.hash)
}

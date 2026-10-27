/** Reads everything that the generated files depend on, and plans each file. Nothing here writes. */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { readAssets, dataUrls, hashUrls, type AssetFiles } from "./assets"
import { imageSpecs, textFiles, type TextFile } from "./files"
import { planImage, type ImagePlan } from "./images"
import { loadSite } from "./load"
import type { HtmlParts } from "./og"
import type { Site } from "./site"

const CSS_FILE = "tools/seo/og.css"

export interface Plan {
  site: Site
  texts: TextFile[]
  images: ImagePlan[]
  drawParts: HtmlParts
}

export function readPlan(root: string, today: string): Plan {
  const site = loadSite(root, today)
  const index = readFileSync(join(root, site.seo.indexHtml), "utf8")
  const css = readFileSync(join(root, CSS_FILE), "utf8")
  const assets = readAssets(root)
  return { site, texts: textFiles(site, index), images: imagePlans(site, css, assets), drawParts: { css, urls: dataUrls(assets) } }
}

function imagePlans(site: Site, css: string, assets: AssetFiles): ImagePlan[] {
  const hashParts: HtmlParts = { css, urls: hashUrls(assets) }
  return imageSpecs(site).map(planImage.bind(null, site, hashParts))
}

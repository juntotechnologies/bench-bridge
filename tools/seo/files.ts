/** The table of generated files: each public text file and the home page, as path and content pairs, and each image as a spec. */
import { renderAgentsJson, renderAgentsTxt } from "./agents"
import { BODY_MARKERS, HEAD_MARKERS, fillBlock } from "./blocks"
import { renderBodyLines } from "./body"
import { renderFavicon, renderIconHtml } from "./graphics"
import { renderHeadLines } from "./head"
import { renderLlms } from "./llms"
import { renderManifest } from "./manifest"
import { renderOgHtml, type HtmlParts } from "./og"
import { renderRobots } from "./robots"
import type { SeoIcon } from "./schema"
import type { Site } from "./site"
import { renderSitemap } from "./sitemap"
import { FILE_NAMES } from "./urls"

export interface TextFile {
  path: string
  content: string
}

export interface ImageSpec {
  path: string
  width: number
  height: number
  html: (site: Site, parts: HtmlParts) => string
}

type Renderer = (site: Site) => string

function publicPath(site: Site, name: string): string {
  return `${site.seo.publicDir}/${name}`
}

function textFile(site: Site, name: string, render: Renderer): TextFile {
  return { path: publicPath(site, name), content: render(site) }
}

function publicTextFiles(site: Site): TextFile[] {
  const { icons, manifest } = site.seo
  return [
    textFile(site, FILE_NAMES.robots, renderRobots),
    textFile(site, FILE_NAMES.sitemap, renderSitemap),
    textFile(site, FILE_NAMES.llms, renderLlms),
    textFile(site, FILE_NAMES.agentsTxt, renderAgentsTxt),
    textFile(site, FILE_NAMES.agentsJson, renderAgentsJson),
    textFile(site, manifest, renderManifest),
    textFile(site, icons.svg, renderFavicon),
  ]
}

/** The home page with its head block and its noscript block filled. */
export function indexFile(site: Site, current: string): TextFile {
  const withHead = fillBlock(current, HEAD_MARKERS, renderHeadLines(site))
  return { path: site.seo.indexHtml, content: fillBlock(withHead, BODY_MARKERS, renderBodyLines(site)) }
}

export function textFiles(site: Site, currentIndex: string): TextFile[] {
  return [...publicTextFiles(site), indexFile(site, currentIndex)]
}

function iconSpec(site: Site, icon: SeoIcon): ImageSpec {
  return { path: publicPath(site, icon.path), width: icon.size, height: icon.size, html: renderIconHtml }
}

export function imageSpecs(site: Site): ImageSpec[] {
  const { og, icons } = site.seo
  const card: ImageSpec = { path: publicPath(site, og.path), width: og.width, height: og.height, html: renderOgHtml }
  return [card, ...[icons.touch, ...icons.app].map(iconSpec.bind(null, site))]
}

/** Renders the page that Chromium turns into the Open Graph image: the brand, the headline and the README screenshot. */
import type { AssetUrls } from "./assets"
import { escapeHtml } from "./html"
import type { Palette, Site } from "./site"

export interface HtmlParts {
  css: string
  urls: AssetUrls
}

function fontFace(family: string, weight: string, url: string): string {
  return `@font-face{font-family:"${family}";font-weight:${weight};src:url(${url}) format("woff2")}`
}

function fontFaces(urls: AssetUrls): string {
  return [fontFace("IBM Plex Mono", "500", urls.mono500), fontFace("IBM Plex Mono", "600", urls.mono600), fontFace("Inter Variable", "100 900", urls.inter)].join("\n")
}

/** The colours as CSS variables, so og.css holds no colour of its own. */
function paletteVars(p: Palette): string {
  const vars = { paper: p.paper, ink: p.ink, "ink-2": p.ink2, card: p.card, "on-card": p.onCard, accent: p.accent, line: p.line, grid: p.grid }
  return `:root{${Object.entries(vars).map(declaration).join(";")}}`
}

function declaration([name, value]: [string, string]): string {
  return `--${name}:${value}`
}

function markTile(site: Site): string {
  return `<span class="mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${site.markPath}"/></svg></span>`
}

function bodyHtml(site: Site, urls: AssetUrls): string {
  const { seo } = site
  return [
    `<div class="brand">${markTile(site)}<span class="name">${escapeHtml(site.name)}</span></div>`,
    `<h1 class="headline">${escapeHtml(seo.headline)}</h1>`,
    `<p class="pill">${escapeHtml(seo.tagline)}</p>`,
    `<p class="steps">${escapeHtml(site.stages.join("  ·  "))}</p>`,
    `<p class="domain">${escapeHtml(site.domain)}</p>`,
    `<img class="shot" src="${urls.screenshot}" alt="" />`,
  ].join("\n")
}

export function renderOgHtml(site: Site, parts: HtmlParts): string {
  const style = [fontFaces(parts.urls), paletteVars(site.light), parts.css].join("\n")
  return `<!doctype html><html lang="${site.seo.language}"><head><meta charset="utf-8"><style>\n${style}\n</style></head><body>\n${bodyHtml(site, parts.urls)}\n</body></html>`
}

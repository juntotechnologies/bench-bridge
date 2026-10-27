/** Renders the head tags of the home page: title, description, canonical, icons, Open Graph, Twitter card and JSON-LD. */
import { escapeHtml, indent, metaTag, safeJson } from "./html"
import { buildJsonLd } from "./jsonLd"
import type { Site } from "./site"
import { absoluteUrl, publicHref } from "./urls"

type Pair = [string, string]

function basicTags(site: Site): string[] {
  const { seo } = site
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    metaTag("name", "description", seo.description),
    `<link rel="canonical" href="${site.url}" />`,
    metaTag("name", "robots", "index, follow, max-image-preview:large"),
  ]
}

function themeTags(site: Site): string[] {
  const light = `<meta name="theme-color" content="${site.light.paper}" media="(prefers-color-scheme: light)" />`
  const dark = `<meta name="theme-color" content="${site.dark.paper}" media="(prefers-color-scheme: dark)" />`
  return [light, dark]
}

function iconTags(site: Site): string[] {
  const { icons, manifest } = site.seo
  return [
    `<link rel="icon" type="image/svg+xml" href="${publicHref(site, icons.svg)}" />`,
    `<link rel="apple-touch-icon" href="${publicHref(site, icons.touch.path)}" />`,
    `<link rel="manifest" href="${publicHref(site, manifest)}" />`,
  ]
}

function propertyTag([key, value]: Pair): string {
  return metaTag("property", key, value)
}

function nameTag([key, value]: Pair): string {
  return metaTag("name", key, value)
}

function pagePairs(site: Site): Pair[] {
  const { seo } = site
  return [
    ["og:type", "website"],
    ["og:site_name", site.demoName],
    ["og:title", seo.title],
    ["og:description", seo.description],
    ["og:url", site.url],
    ["og:locale", seo.locale],
  ]
}

function imagePairs(site: Site): Pair[] {
  const { og } = site.seo
  return [
    ["og:image", absoluteUrl(site, og.path)],
    ["og:image:width", String(og.width)],
    ["og:image:height", String(og.height)],
    ["og:image:alt", og.alt],
  ]
}

function openGraphTags(site: Site): string[] {
  return [...pagePairs(site), ...imagePairs(site)].map(propertyTag)
}

function twitterTags(site: Site): string[] {
  const { seo } = site
  const pairs: Pair[] = [
    ["twitter:card", "summary_large_image"],
    ["twitter:title", seo.title],
    ["twitter:description", seo.description],
    ["twitter:image", absoluteUrl(site, seo.og.path)],
    ["twitter:image:alt", seo.og.alt],
  ]
  return pairs.map(nameTag)
}

function jsonLdTag(site: Site): string {
  return `<script type="application/ld+json">\n${indent(safeJson(buildJsonLd(site)))}\n</script>`
}

export function renderHeadLines(site: Site): string[] {
  return [...basicTags(site), ...themeTags(site), ...iconTags(site), ...openGraphTags(site), ...twitterTags(site), jsonLdTag(site)]
}

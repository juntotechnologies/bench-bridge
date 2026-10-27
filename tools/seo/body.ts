/** Renders the noscript block of the home page: the summary and the links, for a crawler that runs no script. */
import { escapeHtml } from "./html"
import type { ResolvedLink, Site } from "./site"

function linkItem(link: ResolvedLink): string {
  return `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>: ${escapeHtml(link.note)}</li>`
}

function isOtherSite(link: ResolvedLink): boolean {
  return link.kind !== "demo"
}

export function renderBodyLines(site: Site): string[] {
  const items = site.links.filter(isOtherSite).map(linkItem)
  return [
    "<noscript>",
    `  <h1>${escapeHtml(site.demoName)}</h1>`,
    `  <p>${escapeHtml(site.seo.summary)}</p>`,
    `  <p>${escapeHtml(site.seo.needsScript)}</p>`,
    `  <ul>${items.join("")}</ul>`,
    "</noscript>",
  ]
}

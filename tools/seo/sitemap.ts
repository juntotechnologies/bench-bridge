/** Renders sitemap.xml: one entry for each page, with the date of its last change. */
import type { PageEntry, Site } from "./site"
import { GENERATED_NOTE, absoluteUrl } from "./urls"

const XMLNS = "http://www.sitemaps.org/schemas/sitemap/0.9"

function urlEntry(site: Site, page: PageEntry): string {
  return `  <url>\n    <loc>${absoluteUrl(site, page.path)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n  </url>`
}

export function renderSitemap(site: Site): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${GENERATED_NOTE} -->`
  const entries = site.pages.map(urlEntry.bind(null, site)).join("\n")
  return `${header}\n<urlset xmlns="${XMLNS}">\n${entries}\n</urlset>\n`
}

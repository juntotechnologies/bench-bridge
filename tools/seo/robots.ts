/** Renders robots.txt: allow every listed crawler and name the sitemap. */
import type { Site } from "./site"
import { FILE_NAMES, GENERATED_NOTE, absoluteUrl } from "./urls"

function allowBlock(agent: string): string {
  return `User-agent: ${agent}\nAllow: /`
}

export function renderRobots(site: Site): string {
  const blocks = ["*", ...site.seo.crawlers].map(allowBlock).join("\n\n")
  return `# ${GENERATED_NOTE}\n${blocks}\n\nSitemap: ${absoluteUrl(site, FILE_NAMES.sitemap)}\n`
}

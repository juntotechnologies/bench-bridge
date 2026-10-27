/** Draws the brand mark: the favicon as SVG, and the page that Chromium turns into each square icon. */
import type { Site } from "./site"

const MARK_PLACE = "translate(12 12) scale(0.8) translate(-12 -9)"
const SVG_NS = "http://www.w3.org/2000/svg"
const FAVICON_RADIUS = 5.5
const ICON_STYLE = "html,body{margin:0}svg{display:block;width:100vw;height:100vh}"

function markSvg(site: Site, radius: number): string {
  const { card, accent } = site.light
  const stroke = `fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`
  const tile = `<rect width="24" height="24" rx="${radius}" fill="${card}"/>`
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 24 24">${tile}<path d="${site.markPath}" transform="${MARK_PLACE}" ${stroke}/></svg>`
}

export function renderFavicon(site: Site): string {
  return `${markSvg(site, FAVICON_RADIUS)}\n`
}

/** The page for an app icon. The tile is square and full size, because each system rounds the corners itself. */
export function renderIconHtml(site: Site): string {
  return `<!doctype html><meta charset="utf-8"><style>${ICON_STYLE}</style>${markSvg(site, 0)}`
}

/** Renders the web app manifest: the names, the colours and the app icons. */
import type { SeoIcon } from "./schema"
import type { Site } from "./site"
import { publicHref } from "./urls"

export interface ManifestIcon {
  src: string
  sizes: string
  type: string
  purpose: string
}

function manifestIcon(site: Site, icon: SeoIcon): ManifestIcon {
  return { src: publicHref(site, icon.path), sizes: `${icon.size}x${icon.size}`, type: "image/png", purpose: "any" }
}

export function renderManifest(site: Site): string {
  const { seo } = site
  const manifest = {
    name: site.demoName,
    short_name: site.name,
    description: seo.description,
    lang: seo.language,
    start_url: publicHref(site, "."),
    display: "standalone",
    background_color: site.light.paper,
    theme_color: site.light.paper,
    icons: seo.icons.app.map(manifestIcon.bind(null, site)),
  }
  return `${JSON.stringify(manifest, null, 2)}\n`
}

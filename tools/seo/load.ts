/** Loads the Site: reads site/seo.json and joins the facts that the registry, the design tokens and package.json own. */
import { Tokens } from "@design/schema"
import tokensJson from "@design/tokens.json"
import { iconPath } from "@client/ui/icons"
import { catalog, copy, isLive, stages } from "@shared/registry"
import type { CatalogEntry, Stage } from "@shared/registry/schema"
import seoJson from "../../site/seo.json"
import pkg from "../../package.json" with { type: "json" }
import { pageEntry } from "./git"
import { Seo } from "./schema"
import { buildSite, type Instruments, type Site } from "./site"

function entryName(entry: CatalogEntry): string {
  return entry.name
}

function stageLabel(stage: Stage): string {
  return stage.label
}

function isPlanned(entry: CatalogEntry): boolean {
  return !isLive(entry)
}

function instrumentNames(): Instruments {
  return { live: catalog.filter(isLive).map(entryName), planned: catalog.filter(isPlanned).map(entryName) }
}

export function loadSite(root: string, today: string): Site {
  const seo = Seo.parse(seoJson)
  return buildSite({
    seo,
    product: copy.product,
    hub: copy.hub,
    homepage: pkg.homepage,
    instruments: instrumentNames(),
    stages: stages.map(stageLabel),
    tokens: Tokens.parse(tokensJson),
    markPath: iconPath("bridge"),
    pages: seo.pages.map(pageEntry.bind(null, root, today)),
  })
}

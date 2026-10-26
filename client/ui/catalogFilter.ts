/** The catalogue filter: which cards a chip shows, and how many cards each chip counts. */
import { isLive } from "@shared/registry"
import type { CatalogEntry } from "@shared/registry/schema"
import type { CatalogFilter } from "./store"

type Counts = Record<CatalogFilter, number>

export function matchesFilter(filter: CatalogFilter, live: boolean): boolean {
  if (filter === "all") return true
  return filter === "bridged" ? live : !live
}

export function filterCounts(entries: CatalogEntry[]): Counts {
  const bridged = entries.filter(isLive).length
  return { all: entries.length, bridged, planned: entries.length - bridged }
}

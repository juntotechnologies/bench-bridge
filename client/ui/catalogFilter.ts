/** The catalogue filter: which cards a chip shows, by status or by connection, and how many cards each chip counts. */
import { isLive } from "@shared/registry"
import type { CatalogEntry, Connection } from "@shared/registry/schema"
import { CATALOG_FILTERS, STATUS_FILTERS, type CatalogFilter, type StatusFilter } from "./store"

type Counts = Record<CatalogFilter, number>

/** What a chip needs to know about a card. */
export interface CardFacts {
  live: boolean
  connection: Connection
}

type StatusTest = (card: CardFacts) => boolean

const STATUS_TESTS: Record<StatusFilter, StatusTest> = { all: always, bridged: isLiveCard, planned: isPlannedCard }

export function cardFacts(entry: CatalogEntry): CardFacts {
  return { live: isLive(entry), connection: entry.connection }
}

export function matchesFilter(filter: CatalogFilter, card: CardFacts): boolean {
  return isStatusFilter(filter) ? STATUS_TESTS[filter](card) : card.connection === filter
}

export function filterCounts(entries: CatalogEntry[]): Counts {
  const cards = entries.map(cardFacts)
  return Object.fromEntries(CATALOG_FILTERS.map(countEntry.bind(null, cards))) as Counts
}

function countEntry(cards: CardFacts[], filter: CatalogFilter): [CatalogFilter, number] {
  return [filter, cards.filter(matchesFilter.bind(null, filter)).length]
}

function isStatusFilter(filter: CatalogFilter): filter is StatusFilter {
  return (STATUS_FILTERS as readonly string[]).includes(filter)
}

function always(): boolean {
  return true
}

function isLiveCard(card: CardFacts): boolean {
  return card.live
}

function isPlannedCard(card: CardFacts): boolean {
  return !card.live
}

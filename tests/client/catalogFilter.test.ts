/** Tests for the catalogue filter: which cards each chip shows, by status or by connection, and the count on each chip. */
import { describe, expect, it } from "vitest"
import { catalog, copy, isLive } from "@shared/registry"
import { Connection } from "@shared/registry/schema"
import { cardFacts, filterCounts, matchesFilter } from "@client/ui/catalogFilter"
import { CATALOG_FILTERS, STATUS_FILTERS } from "@client/ui/store"

const LIVE_SERIAL = { live: true, connection: "rs232" } as const
const PLANNED_GPIB = { live: false, connection: "gpib" } as const

describe("matchesFilter", () => {
  it("shows every card for All, live cards for Bridged and planned cards for Planned", () => {
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("all", card))).toEqual([true, true])
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("bridged", card))).toEqual([true, false])
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("planned", card))).toEqual([false, true])
  })

  it("shows only the cards with that connection for a connection chip", () => {
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("rs232", card))).toEqual([true, false])
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("gpib", card))).toEqual([false, true])
    expect([LIVE_SERIAL, PLANNED_GPIB].map((card) => matchesFilter("lan", card))).toEqual([false, false])
  })
})

describe("cardFacts", () => {
  it("reads the live state and the connection of a catalogue entry", () => {
    const entry = catalog[0]!
    expect(cardFacts(entry)).toEqual({ live: isLive(entry), connection: entry.connection })
  })
})

describe("filterCounts", () => {
  it("counts the cards each chip shows", () => {
    const live = catalog.filter(isLive).length
    const counts = filterCounts(catalog)
    expect([counts.all, counts.bridged, counts.planned]).toEqual([catalog.length, live, catalog.length - live])
  })

  it("puts every card in exactly one connection", () => {
    const counts = filterCounts(catalog)
    expect(Connection.options.reduce((sum, id) => sum + counts[id], 0)).toBe(catalog.length)
  })
})

describe("chip labels", () => {
  it("has one status label for each status filter, in order", () => {
    expect(copy.filters.map((filter) => filter.id)).toEqual([...STATUS_FILTERS])
  })

  it("has one connection label for each connection, in order", () => {
    expect(copy.connections.map((entry) => entry.id)).toEqual([...Connection.options])
  })

  it("has one chip for each status and each connection", () => {
    expect([...CATALOG_FILTERS]).toEqual([...STATUS_FILTERS, ...Connection.options])
  })
})

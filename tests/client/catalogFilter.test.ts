/** Tests for the catalogue filter: which cards each filter shows, and the count on each chip. */
import { describe, expect, it } from "vitest"
import { catalog, copy, isLive } from "@shared/registry"
import { filterCounts, matchesFilter } from "@client/ui/catalogFilter"
import { CATALOG_FILTERS } from "@client/ui/store"

describe("matchesFilter", () => {
  it("shows every card for All, live cards for Bridged and planned cards for Planned", () => {
    expect([true, false].map((live) => matchesFilter("all", live))).toEqual([true, true])
    expect([true, false].map((live) => matchesFilter("bridged", live))).toEqual([true, false])
    expect([true, false].map((live) => matchesFilter("planned", live))).toEqual([false, true])
  })
})

describe("filterCounts", () => {
  it("counts the cards each chip shows", () => {
    const live = catalog.filter(isLive).length
    expect(filterCounts(catalog)).toEqual({ all: catalog.length, bridged: live, planned: catalog.length - live })
  })
})

describe("copy.filters", () => {
  it("has one label for each filter, in order", () => {
    expect(copy.filters.map((filter) => filter.id)).toEqual([...CATALOG_FILTERS])
  })
})

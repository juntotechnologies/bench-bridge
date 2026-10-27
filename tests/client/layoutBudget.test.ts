/** Tests for the layout budget: tap size, equal rows, equal side margins and heading lines. */
import { describe, expect, it } from "vitest"
import { hasUnevenRow, lopsided, overlong, rowsOf, undersized, type Box } from "@client/scripts/layoutBudget"

function box(x: number, y: number, width: number, height: number): Box {
  return { x, y, width, height }
}

describe("undersized", () => {
  it("passes a box that is exactly the tap size", () => {
    expect(undersized([box(0, 0, 44, 44)], 44)).toEqual([])
  })

  it("fails a box that is short, even when it is wide", () => {
    expect(undersized([box(0, 0, 200, 36)], 44)).toEqual([box(0, 0, 200, 36)])
  })

  it("fails a box that is narrow, even when it is tall", () => {
    expect(undersized([box(0, 0, 30, 60)], 44)).toHaveLength(1)
  })

  it("forgives a half pixel of rounding", () => {
    expect(undersized([box(0, 0, 43.6, 44)], 44)).toEqual([])
  })
})

describe("rowsOf", () => {
  it("puts boxes with the same top in one row and starts a new row for another top", () => {
    const rows = rowsOf([box(0, 10, 50, 20), box(60, 11, 50, 20), box(0, 80, 50, 20)], 2)
    expect(rows.map((row) => row.length)).toEqual([2, 1])
  })
})

describe("hasUnevenRow", () => {
  it("passes buttons of one width", () => {
    expect(hasUnevenRow([box(0, 0, 100, 44), box(106, 0, 100, 44), box(212, 0, 100.5, 44)], 1)).toBe(false)
  })

  it("fails a row where one button is wider", () => {
    expect(hasUnevenRow([box(0, 0, 100, 44), box(106, 0, 130, 44)], 1)).toBe(true)
  })

  it("compares only buttons in the same row", () => {
    expect(hasUnevenRow([box(0, 0, 100, 44), box(0, 60, 180, 44)], 1)).toBe(false)
  })
})

describe("lopsided", () => {
  it("passes a box with equal gaps", () => {
    expect(lopsided([box(12, 0, 366, 40)], 390, 1)).toEqual([])
  })

  it("fails a box that sits closer to one edge", () => {
    expect(lopsided([box(12, 0, 340, 40)], 390, 1)).toHaveLength(1)
  })
})

describe("overlong", () => {
  it("keeps only the line counts over the limit", () => {
    expect(overlong([1, 2, 3, 4], 2)).toEqual([3, 4])
  })
})

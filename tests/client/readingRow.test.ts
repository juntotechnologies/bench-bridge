/** Tests for how a reading shows in the Data tab: its value, its detail and its tag. */
import { describe, expect, it } from "vitest"
import { readingDetail, readingTag, readingValue } from "@client/ui/inspector/data"
import type { Reading } from "@shared/bridge/types"

const base: Reading = { quantity: "Mass", value: 25.479, unit: "g", places: 4, takenAt: "2026-10-26T14:02:10.000Z", sampleId: "S-1", status: "stable", extras: {} }
const peak: Reading = { ...base, quantity: "Drug", value: 98.1, unit: "%", places: 2, extras: { minutes: 4.37, area: 287650, role: "main peak" } }

describe("readingValue", () => {
  it("shows the decimals the instrument reports", () => {
    expect([readingValue(base), readingValue(peak)]).toEqual(["25.4790", "98.10"])
  })
})

describe("readingDetail", () => {
  it("shows the time of day for a weight and the retention time for a peak", () => {
    expect([readingDetail(base), readingDetail(peak)]).toEqual(["14:02:10", "4.37 min"])
  })

  it("keeps the trailing zero the report prints", () => {
    expect(readingDetail({ ...peak, extras: { minutes: 5.9 } })).toBe("5.90 min")
  })
})

describe("readingTag", () => {
  it("shows the stability flag for a weight and the role for a peak", () => {
    expect([readingTag(base), readingTag(peak)]).toEqual(["stable", "main peak"])
  })
})

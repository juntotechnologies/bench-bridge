/** Tests for how a reading shows in the Data tab: its value, its detail and its tag. */
import { describe, expect, it } from "vitest"
import { readingDetail, readingTag } from "@client/ui/inspector/data"
import { printed } from "@shared/bridge/numbers"
import type { Reading } from "@shared/bridge/types"

const base: Reading = { quantity: "Mass", value: 25.479, unit: "g", places: 4, takenAt: "2026-10-26T14:02:10.000Z", sampleId: "S-1", status: "stable", extras: {} }
const peak: Reading = { ...base, quantity: "Drug", value: 98.1, unit: "%", places: 2, extras: { minutes: 4.37, area: 287650, role: "main peak" } }

describe("printed", () => {
  it("shows the decimals the instrument reports", () => {
    expect([printed(base), printed(peak)]).toEqual(["25.4790", "98.10"])
  })
})

describe("readingDetail", () => {
  it("shows the time of day for a weight and the retention time for a peak", () => {
    expect([readingDetail(base), readingDetail(peak)]).toEqual(["14:02:10", "4.37 min"])
  })

  it("keeps the trailing zero the report prints", () => {
    expect(readingDetail({ ...peak, extras: { minutes: 5.9 } })).toBe("5.90 min")
  })

  it("shows the internal standard area for a quantitated result, so a reader sees why the rule dropped it", () => {
    expect(readingDetail({ ...base, extras: { area: 5120, isArea: 41200 } })).toBe("IS area 41200")
  })
})

describe("readingTag", () => {
  it("shows the stability flag for a weight and the role for a peak", () => {
    expect([readingTag(base), readingTag(peak)]).toEqual(["stable", "main peak"])
  })
})

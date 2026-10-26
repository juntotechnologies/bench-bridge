import { describe, expect, it } from "vitest"
import { stampLines } from "@shared/bridge/capture"
import { parseCapture } from "@shared/bridge/parsers"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"

const balance = deviceById("balance") as Device

describe("stampLines", () => {
  it("stamps each line from the start time and cadence", () => {
    const lines = stampLines({ ...balance.capture, startedAt: "2026-10-26T14:02:10Z", cadenceMs: 1000, lines: ["a", "b"] })
    expect(lines).toEqual([
      { at: "2026-10-26T14:02:10.000Z", text: "a" },
      { at: "2026-10-26T14:02:11.000Z", text: "b" },
    ])
  })
})

describe("sics-line parser", () => {
  it("reads each weight line and keeps the stability flag", () => {
    const readings = parseCapture(balance.parser, stampLines(balance.capture), "S-1")
    expect(readings.map((r) => [r.value, r.unit, r.status])).toEqual([
      [25.479, "g", "unstable"],
      [25.4821, "g", "stable"],
      [25.4102, "g", "unstable"],
      [25.3655, "g", "unstable"],
      [25.3617, "g", "stable"],
    ])
  })

  it("ignores lines that are not weights", () => {
    const lines = stampLines({ ...balance.capture, lines: ["ES", "S I", "S S 1.5000 g"] })
    expect(parseCapture(balance.parser, lines, "S-1")).toHaveLength(1)
  })
})

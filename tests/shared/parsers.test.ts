/** Tests for line stamping and the balance line parser. */
import { describe, expect, it } from "vitest"
import { stampLines } from "@shared/bridge/capture"
import { parseCapture } from "@shared/bridge/parsers"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"

const balance = deviceById("balance") as Device
const hplc = deviceById("hplc") as Device

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

describe("peak-table parser", () => {
  it("reads each peak row: name, area percent, retention time and area", () => {
    const readings = parseCapture(hplc.parser, stampLines(hplc.capture), "S-1")
    expect(readings.map((r) => [r.quantity, r.value, r.unit, r.extras["minutes"], r.extras["area"]])).toEqual([
      ["Solvent front", 0.41, "%", 1.82, 1204],
      ["Codeine phosphate", 98.1, "%", 4.37, 287650],
      ["Impurity A", 1.06, "%", 5.9, 3120],
      ["Impurity B", 0.43, "%", 7.24, 1250],
    ])
  })

  it("names the analyte peak the main peak and the others impurities", () => {
    const readings = parseCapture(hplc.parser, stampLines(hplc.capture), "S-1")
    expect(readings.map((r) => r.extras["role"])).toEqual(["impurity", "main peak", "impurity", "impurity"])
  })

  it("keeps the decimals the report prints", () => {
    expect(parseCapture(hplc.parser, stampLines(hplc.capture), "S-1").map((r) => r.places)).toEqual([2, 2, 2, 2])
    expect(parseCapture(balance.parser, stampLines(balance.capture), "S-1").map((r) => r.places)).toEqual([4, 4, 4, 4, 4])
  })

  it("ignores the title and header lines", () => {
    const lines = stampLines({ ...hplc.capture, lines: ["Sample: S-1", "Peak RT(min) Area Area% Name"] })
    expect(parseCapture(hplc.parser, lines, "S-1")).toEqual([])
  })
})

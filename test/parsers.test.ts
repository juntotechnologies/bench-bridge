import { describe, expect, it } from "vitest"
import { stampLines } from "../src/bridge/capture"
import { parseCapture } from "../src/bridge/parsers"
import { deviceById } from "../src/registry"
import type { Device } from "../src/registry/schema"

function readingsOf(id: string) {
  const device = deviceById(id) as Device
  return parseCapture(device.parser, stampLines(device.capture), device.capture.sampleId)
}

describe("stampLines", () => {
  it("stamps each line from the start time and cadence", () => {
    const lines = stampLines({ startedAt: "2026-10-26T14:02:10Z", cadenceMs: 1000, sampleId: "S", lines: ["a", "b"] })
    expect(lines).toEqual([
      { at: "2026-10-26T14:02:10.000Z", text: "a" },
      { at: "2026-10-26T14:02:11.000Z", text: "b" },
    ])
  })
})

describe("parsers", () => {
  it("reads balance lines and keeps the stability flag", () => {
    const readings = readingsOf("balance")
    expect(readings.map((r) => [r.value, r.unit, r.status])).toEqual([
      [119.9871, "g", "unstable"],
      [120.0412, "g", "unstable"],
      [120.0453, "g", "stable"],
      [120.0454, "g", "stable"],
    ])
  })

  it("reads a printout block into one reading with extras", () => {
    const [reading] = readingsOf("ph-meter")
    expect(reading).toMatchObject({ quantity: "pH", value: 7.012, unit: "pH", sampleId: "BUF-7" })
    expect(reading?.extras).toEqual({ potentialMv: -0.4, temperatureC: 24.8, slopePct: 98.6 })
  })

  it("keeps text extras as text", () => {
    const [reading] = readingsOf("thermal-cycler")
    expect(reading?.extras).toEqual({ program: "PCR-35", cycles: 35, runStatus: "OK" })
    expect(reading?.sampleId).toBe("PCR-2026-311")
  })

  it("reads GPIB answers and adds the ratio reading", () => {
    const readings = readingsOf("uv-vis")
    expect(readings.map((r) => [r.quantity, r.value])).toEqual([
      ["absorbance", 0.8421],
      ["absorbance", 0.4502],
      ["A260/A280", 1.87],
    ])
    expect(readings[0]?.extras).toEqual({ wavelengthNm: 260 })
  })

  it("reads a plate grid into 96 wells", () => {
    const readings = readingsOf("plate-reader")
    expect(readings).toHaveLength(96)
    expect(readings[0]).toMatchObject({ value: 2.41, extras: { well: "A1" } })
    expect(readings[95]?.extras).toEqual({ well: "H12" })
  })

  it("turns a current trace into one spin with its length", () => {
    const [spin] = readingsOf("centrifuge")
    expect(spin).toMatchObject({ quantity: "Spin", value: 10.08, unit: "min", takenAt: "2026-10-26T09:24:10Z" })
    expect(spin?.extras).toEqual({ peakAmps: 6.8 })
  })

  it("reads analog loop samples in mA", () => {
    const readings = readingsOf("freezer")
    expect(readings).toHaveLength(5)
    expect(readings[0]).toMatchObject({ value: 7.184, unit: "mA", extras: { channel: 0 } })
  })

  it("ignores lines that do not match the protocol", () => {
    const device = deviceById("balance") as Device
    const lines = stampLines({ ...device.capture, lines: ["ES", "S S 1.5000 g"] })
    expect(parseCapture(device.parser, lines, "X")).toHaveLength(1)
  })
})

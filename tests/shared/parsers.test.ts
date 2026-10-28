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

describe("ph-line parser", () => {
  const meter = deviceById("ph-meter") as Device

  it("reads the pH, the temperature and whether the value has settled", () => {
    const readings = parseCapture(meter.parser, stampLines(meter.capture), "S-1")
    expect(readings.map((r) => [r.value, r.unit, r.status, r.extras["temperature"]])).toEqual([
      [4.31, "pH", "unstable", 25],
      [6.84, "pH", "unstable", 25.1],
      [7.03, "pH", "unstable", 25.1],
      [7.02, "pH", "stable", 25.1],
      [7.02, "pH", "stable", 25.1],
    ])
  })

  it("keeps the two decimals the meter prints", () => {
    expect(parseCapture(meter.parser, stampLines(meter.capture), "S-1").every((r) => r.places === 2)).toBe(true)
  })

  it("ignores lines that are not readings", () => {
    const lines = stampLines({ ...meter.capture, lines: ["CAL OK", "pH 7.00 25.0C WAIT", "pH 7.00 25.0C READY"] })
    expect(parseCapture(meter.parser, lines, "S-1")).toHaveLength(1)
  })
})

describe("labelled-lines parser", () => {
  const titrator = deviceById("kf-titrator") as Device

  it("reads each labelled value with its unit and the decimals printed", () => {
    const readings = parseCapture(titrator.parser, stampLines(titrator.capture), "S-1")
    expect(readings.map((r) => [r.quantity, r.value, r.unit, r.places])).toEqual([
      ["Sample wt", 1.2034, "g", 4],
      ["Titrant", 4.82, "mL", 2],
      ["Drift", 8.1, "ug/min", 1],
      ["Water", 0.412, "%", 3],
    ])
  })

  it("ignores the title lines and any label it does not know", () => {
    const lines = stampLines({ ...titrator.capture, lines: ["KF-20  RESULT", "Sample S-1", "Cell temp   25.0  C", "Water   0.5  %"] })
    expect(parseCapture(titrator.parser, lines, "S-1").map((r) => r.quantity)).toEqual(["Water"])
  })
})

describe("peak-table parser for a solvent screen", () => {
  const gc = deviceById("gc") as Device

  it("reads the unit from the config and names every peak a solvent when the method has no analyte", () => {
    const readings = parseCapture(gc.parser, stampLines(gc.capture), "S-1")
    expect(readings.map((r) => [r.quantity, r.value, r.unit, r.extras["role"]])).toEqual([
      ["Air", 0, "ppm", "solvent"],
      ["Methanol", 412.5, "ppm", "solvent"],
      ["Ethanol", 198.3, "ppm", "solvent"],
      ["Acetone", 41.7, "ppm", "solvent"],
    ])
  })
})

describe("peak-table parser for a library match report", () => {
  const gcms = deviceById("gc-ms") as Device

  it("reads a whole-number match quality as the value", () => {
    const readings = parseCapture(gcms.parser, stampLines(gcms.capture), "S-1")
    expect(readings.map((r) => [r.quantity, r.value, r.unit, r.places, r.extras["minutes"]])).toEqual([
      ["Air", 0, "% match", 0, 1.12],
      ["Oxycodone", 97, "% match", 0, 7.85],
      ["Caffeine", 88, "% match", 0, 9.14],
      ["Unknown", 52, "% match", 0, 10.62],
    ])
  })
})

describe("csv-export parser for a results file", () => {
  const lcms = deviceById("lc-ms") as Device

  it("reads one reading for each row after the header, with its areas", () => {
    const readings = parseCapture(lcms.parser, stampLines(lcms.capture), "S-1")
    expect(readings.map((r) => [r.quantity, r.value, r.unit, r.places])).toEqual([
      ["Fentanyl", 12.4, "ng/mL", 2],
      ["Norfentanyl", 2.71, "ng/mL", 2],
      ["Acetyl fentanyl", 0.08, "ng/mL", 2],
      ["Carfentanil", 0.36, "ng/mL", 2],
    ])
    expect(readings[0]?.extras).toEqual({ area: 184220, isArea: 95310 })
  })

  it("takes the sample from the row, and finds each column by its header", () => {
    const lines = stampLines({ ...lcms.capture, lines: ["Conc (ng/mL),Analyte,Sample,IS Area,Area", "1.50,Morphine,S-9,90000,1200"] })
    const [reading] = parseCapture(lcms.parser, lines, "S-1")
    expect([reading?.sampleId, reading?.quantity, reading?.value, reading?.extras["isArea"]]).toEqual(["S-9", "Morphine", 1.5, 90000])
  })

  it("skips a row with no number in the value column", () => {
    const lines = stampLines({ ...lcms.capture, lines: [lcms.capture.lines[0]!, "S-1,Blank,0,90000,N/A"] })
    expect(parseCapture(lcms.parser, lines, "S-1")).toEqual([])
  })
})

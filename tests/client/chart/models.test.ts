/** Tests for the chart models: the chromatogram of the HPLC run and the weight trace of the balance run. */
import { describe, expect, it } from "vitest"
import { runBridge } from "@shared/bridge/pipeline"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { chartFor, chartKind } from "@client/ui/chart/model"
import { chromatogram, peakCurve } from "@client/ui/chart/chromatogram"
import { valueTrace } from "@client/ui/chart/trace"

const hplc = runBridge(deviceById("hplc") as Device)
const balance = runBridge(deviceById("balance") as Device)
const meter = runBridge(deviceById("ph-meter") as Device)
const titrator = runBridge(deviceById("kf-titrator") as Device)
const solvents = runBridge(deviceById("gc") as Device)

describe("chartKind", () => {
  it("draws a chromatogram for peaks and a trace for weights", () => {
    expect([chartKind(hplc.readings), chartKind(balance.readings)]).toEqual(["chromatogram", "trace"])
  })

  it("picks the builder by kind", () => {
    expect(chartFor(hplc, true)?.title).toBe(chromatogram(hplc, true).title)
    expect(chartFor(balance, true)?.title).toBe(valueTrace(balance, true).title)
  })
})

describe("peakCurve", () => {
  it("rises to the height at the centre and returns to the baseline at both ends", () => {
    const curve = peakCurve(4, 0.5, 0.1)
    const top = curve.reduce((best, point) => (point.y > best.y ? point : best))
    expect([top.x, top.y]).toEqual([4, 0.5])
    expect([curve[0]?.y, curve.at(-1)?.y].every((y) => (y ?? 1) < 0.001)).toBe(true)
  })
})

describe("chromatogram", () => {
  it("draws one line for each peak, the main peak at full height", () => {
    const chart = chromatogram(hplc, true)
    expect(chart.lines.map((line) => line.state)).toEqual(["dropped", "main", "kept", "kept"])
    const tops = chart.lines.map((line) => Math.max(...line.points.map((point) => point.y)))
    expect(tops[1]).toBe(1)
    expect(tops.every((top) => top <= 1)).toBe(true)
  })

  it("keeps every peak neutral until the rules are applied", () => {
    expect(chromatogram(hplc, false).lines.map((line) => line.state)).toEqual(["kept", "main", "kept", "kept"])
  })

  it("labels the main peak with its name and share, and the dropped peak as dropped", () => {
    const texts = chromatogram(hplc, true).notes.map((note) => note.text)
    expect(texts[1]).toBe("Codeine phosphate 98.10 %")
    expect(texts[0]).toBe("dropped")
  })

  it("puts minutes on the x axis and no numbers on the y axis", () => {
    const chart = chromatogram(hplc, true)
    expect(chart.x.ticks.map((tick) => tick.label)).toEqual(["0", "2", "4", "6", "8"])
    expect(chart.y.ticks).toEqual([])
  })
})

describe("valueTrace", () => {
  it("draws a dot for each reading, hollow for the dropped ones", () => {
    const chart = valueTrace(balance, true)
    expect(chart.dots.length).toBe(balance.readings.length)
    expect(chart.dots.filter((dot) => dot.state === "dropped").length).toBe(balance.normalized.dropped.length)
  })

  it("keeps every dot filled until the rules are applied", () => {
    expect(valueTrace(balance, false).dots.every((dot) => dot.state === "kept")).toBe(true)
  })

  it("labels the first and last kept weight with the digits the balance prints", () => {
    const texts = valueTrace(balance, true).notes.map((note) => note.text)
    expect(texts).toEqual(["25.4821 g", "25.3617 g"])
  })

  it("starts the x axis at zero seconds", () => {
    expect(valueTrace(balance, true).x.domain[0]).toBe(0)
  })
})

describe("valueTrace for another instrument", () => {
  it("names the trace from the quantity the instrument reports", () => {
    expect([valueTrace(balance, true).title, valueTrace(meter, true).title]).toEqual(["Weight trace", "pH trace"])
  })

  it("labels the settled value that the rules keep, not a difference", () => {
    expect(valueTrace(meter, true).notes.map((note) => note.text)).toEqual(["7.02 pH"])
  })

  it("draws a trace for a series of values and no peaks", () => {
    expect(chartKind(meter.readings)).toBe("trace")
  })
})

describe("a strip of single values", () => {
  it("has no chart, because no quantity repeats and no peak has a retention time", () => {
    expect(chartKind(titrator.readings)).toBeNull()
    expect(chartFor(titrator, true)).toBeNull()
  })
})

describe("chromatogram of a run with no analyte peak", () => {
  it("names every peak, and marks the air peak dropped", () => {
    const texts = chromatogram(solvents, true).notes.map((note) => note.text)
    expect(texts).toEqual(["dropped", "Methanol", "412.50 ppm", "Ethanol", "198.30 ppm", "Acetone", "41.70 ppm"])
  })

  it("draws no main peak", () => {
    expect(chromatogram(solvents, true).lines.map((line) => line.state)).toEqual(["dropped", "kept", "kept", "kept"])
  })
})

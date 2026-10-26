/** Tests for the chart models: the chromatogram of the HPLC run and the weight trace of the balance run. */
import { describe, expect, it } from "vitest"
import { runBridge } from "@shared/bridge/pipeline"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { chartFor, chartKind } from "@client/ui/chart/model"
import { chromatogram, peakCurve } from "@client/ui/chart/chromatogram"
import { weightTrace } from "@client/ui/chart/trace"

const hplc = runBridge(deviceById("hplc") as Device)
const balance = runBridge(deviceById("balance") as Device)

describe("chartKind", () => {
  it("draws a chromatogram for peaks and a trace for weights", () => {
    expect([chartKind(hplc.readings), chartKind(balance.readings)]).toEqual(["chromatogram", "trace"])
  })

  it("picks the builder by kind", () => {
    expect(chartFor(hplc, true).title).toBe(chromatogram(hplc, true).title)
    expect(chartFor(balance, true).title).toBe(weightTrace(balance, true).title)
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

describe("weightTrace", () => {
  it("draws a dot for each reading, hollow for the dropped ones", () => {
    const chart = weightTrace(balance, true)
    expect(chart.dots.length).toBe(balance.readings.length)
    expect(chart.dots.filter((dot) => dot.state === "dropped").length).toBe(balance.normalized.dropped.length)
  })

  it("keeps every dot filled until the rules are applied", () => {
    expect(weightTrace(balance, false).dots.every((dot) => dot.state === "kept")).toBe(true)
  })

  it("labels the first and last kept weight with the digits the balance prints", () => {
    const texts = weightTrace(balance, true).notes.map((note) => note.text)
    expect(texts).toEqual(["25.4821 g", "25.3617 g"])
  })

  it("starts the x axis at zero seconds", () => {
    expect(weightTrace(balance, true).x.domain[0]).toBe(0)
  })
})

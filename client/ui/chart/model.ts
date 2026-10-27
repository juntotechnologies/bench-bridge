/** Picks the chart for a run: a chromatogram when the readings are peaks, a trace of values otherwise. */
import type { BridgeRun, Reading } from "@shared/bridge/types"
import { chromatogram } from "./chromatogram"
import { valueTrace } from "./trace"
import type { Chart } from "./types"

export type ChartKind = "chromatogram" | "trace"
type Builder = (run: BridgeRun, ruled: boolean) => Chart

const BUILDERS: Record<ChartKind, Builder> = { chromatogram, trace: valueTrace }

/** A chromatogram for peaks, a trace for a series of one quantity, and no chart for a strip of single values. */
export function chartKind(readings: Reading[]): ChartKind | null {
  if (readings.some(hasRetention)) return "chromatogram"
  return readings.some(repeats.bind(null, readings)) ? "trace" : null
}

function repeats(readings: Reading[], reading: Reading): boolean {
  return readings.filter(sameQuantity.bind(null, reading)).length > 1
}

function sameQuantity(reading: Reading, other: Reading): boolean {
  return other.quantity === reading.quantity
}

function hasRetention(reading: Reading): boolean {
  return typeof reading.extras["minutes"] === "number"
}

export function chartFor(run: BridgeRun, ruled: boolean): Chart | null {
  const kind = chartKind(run.readings)
  return kind === null ? null : BUILDERS[kind](run, ruled)
}

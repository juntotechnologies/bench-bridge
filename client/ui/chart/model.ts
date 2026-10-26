/** Picks the chart for a run: a chromatogram when the readings are peaks, a weight trace otherwise. */
import type { BridgeRun, Reading } from "@shared/bridge/types"
import { chromatogram } from "./chromatogram"
import { weightTrace } from "./trace"
import type { Chart } from "./types"

export type ChartKind = "chromatogram" | "trace"
type Builder = (run: BridgeRun, ruled: boolean) => Chart

const BUILDERS: Record<ChartKind, Builder> = { chromatogram, trace: weightTrace }

export function chartKind(readings: Reading[]): ChartKind {
  return readings.some(hasRetention) ? "chromatogram" : "trace"
}

function hasRetention(reading: Reading): boolean {
  return typeof reading.extras["minutes"] === "number"
}

export function chartFor(run: BridgeRun, ruled: boolean): Chart {
  return BUILDERS[chartKind(run.readings)](run, ruled)
}

/** The run readout: how long the run has been going, in seconds with one decimal. */
import { copy } from "@shared/registry"

const MS = 1000

export function elapsedText(startedAt: number, now: number): string {
  const seconds = Math.max(0, now - startedAt) / MS
  return `${seconds.toFixed(1)} ${copy.chart.seconds}`
}

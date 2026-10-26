/** Peak roles in a chromatography report: the analyte peak and everything else. */
import type { Reading } from "./types"

export const MAIN_PEAK = "main peak"
export const IMPURITY = "impurity"
export const PERCENT_UNIT = "%"
const RETENTION_PLACES = 2

export function roleOf(analyte: string, name: string): string {
  return name === analyte ? MAIN_PEAK : IMPURITY
}

export function isMainPeak(reading: Reading): boolean {
  return reading.extras["role"] === MAIN_PEAK
}

/** The peak area the report prints, or zero when the reading has none. */
export function areaOf(reading: Reading): number {
  return Number(reading.extras["area"] ?? 0)
}

/** The retention time with the decimals the report prints. */
export function retentionText(minutes: number): string {
  return minutes.toFixed(RETENTION_PLACES)
}

/** Peak roles in a chromatography report: the analyte peak and everything else. */
import type { Reading } from "./types"

export const MAIN_PEAK = "main peak"
export const IMPURITY = "impurity"
export const PERCENT_UNIT = "%"
const RETENTION_PLACES = 2

/** How a report names its peaks: one analyte peak, if the method has one, and a role for every other peak. */
export interface PeakRoles {
  analyte?: string | undefined
  role?: string | undefined
}

export function roleOf(roles: PeakRoles, name: string): string {
  return name === roles.analyte ? MAIN_PEAK : (roles.role ?? IMPURITY)
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

/** Applies the device's rules: drop unstable weights, then weigh by difference. */
import type { NormalizeRules } from "../registry/schema"
import type { Normalized, Reading } from "./types"
import { round } from "./numbers"

const MASS_PLACES = 4

/** Apply the device's rules in order: drop unstable readings, then weigh by difference. */
export function normalize(rules: NormalizeRules, readings: Reading[]): Normalized {
  const dropped = rules.dropUnstable ? readings.filter(isUnstable) : []
  const stable = readings.filter(isKept.bind(null, dropped))
  const kept = rules.byDifference ? byDifference(rules.byDifference.quantity, stable) : stable
  return { stable, dropped, kept }
}

/** Container weighed before and after: the amount used is the first weight less the last. */
function byDifference(quantity: string, readings: Reading[]): Reading[] {
  const first = readings[0]
  const last = readings[readings.length - 1]
  if (!first || !last || first === last) return []
  return [{ ...last, quantity, value: round(first.value - last.value, MASS_PLACES) }]
}

function isUnstable(reading: Reading): boolean {
  return reading.status === "unstable"
}

function isKept(dropped: Reading[], reading: Reading): boolean {
  return !dropped.includes(reading)
}

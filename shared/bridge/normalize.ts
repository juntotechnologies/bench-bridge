/** Applies the device's rules: drop readings, then derive the reading to deliver. */
import type { NormalizeRules } from "../registry/schema"
import type { Normalized, Reading } from "./types"
import { round } from "./numbers"
import { areaOf, isMainPeak, PERCENT_UNIT } from "./peaks"

const MASS_PLACES = 4
const PURITY_PLACES = 2
const PERCENT = 100

/** Apply the device's rules in order: drop readings, then derive the one to deliver, if a rule asks for it. */
export function normalize(rules: NormalizeRules, readings: Reading[]): Normalized {
  const dropped = readings.filter(isDropped.bind(null, rules))
  const stable = readings.filter(isKept.bind(null, dropped))
  return { stable, dropped, kept: derive(rules, stable) }
}

function isDropped(rules: NormalizeRules, reading: Reading): boolean {
  return (rules.dropUnstable === true && reading.status === "unstable") || elutesTooEarly(rules.dropBeforeMinutes, reading)
}

/** The solvent front: a peak that comes off the column before the limit. */
function elutesTooEarly(limit: number | undefined, reading: Reading): boolean {
  const minutes = reading.extras["minutes"]
  return limit !== undefined && typeof minutes === "number" && minutes < limit
}

function derive(rules: NormalizeRules, stable: Reading[]): Reading[] {
  if (rules.byDifference) return byDifference(rules.byDifference.quantity, stable)
  if (rules.purity) return purity(rules.purity.quantity, stable)
  return stable
}

/** Container weighed before and after: the amount used is the first weight less the last. */
function byDifference(quantity: string, readings: Reading[]): Reading[] {
  const first = readings[0]
  const last = readings[readings.length - 1]
  if (!first || !last || first === last) return []
  return [{ ...last, quantity, value: round(first.value - last.value, MASS_PLACES) }]
}

/** Purity by area percent: the main peak's area as a share of the area that is left. */
function purity(quantity: string, readings: Reading[]): Reading[] {
  const main = readings.find(isMainPeak)
  const total = readings.reduce(addArea, 0)
  if (!main || total === 0) return []
  const value = round((areaOf(main) / total) * PERCENT, PURITY_PLACES)
  return [{ ...main, quantity, value, unit: PERCENT_UNIT, places: PURITY_PLACES }]
}

function addArea(total: number, reading: Reading): number {
  return total + areaOf(reading)
}

function isKept(dropped: Reading[], reading: Reading): boolean {
  return !dropped.includes(reading)
}

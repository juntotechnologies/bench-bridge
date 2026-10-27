/** Applies the device's rules: drop readings, then derive the reading to deliver. */
import type { NormalizeRules } from "../registry/schema"
import type { Normalized, Reading } from "./types"
import { round } from "./numbers"
import { areaOf, isMainPeak, PERCENT_UNIT } from "./peaks"

const MASS_PLACES = 4
const PURITY_PLACES = 2
const PERCENT = 100

/** A rule that drops a reading. It is silent when the device does not ask for it. */
type DropRule = (rules: NormalizeRules, reading: Reading) => boolean

/** A rule that picks the readings to deliver. It returns null when the device does not ask for it. */
type Derivation = (rules: NormalizeRules, stable: Reading[]) => Reading[] | null

const DROP_RULES: DropRule[] = [dropsUnstable, elutesTooEarly, isOtherQuantity]
const DERIVATIONS: Derivation[] = [fromDifference, fromPurity, fromLast]

/** Apply the device's rules in order: drop readings, then derive the one to deliver, if a rule asks for it. */
export function normalize(rules: NormalizeRules, readings: Reading[]): Normalized {
  const dropped = readings.filter(isDropped.bind(null, rules))
  const stable = readings.filter(isKept.bind(null, dropped))
  return { stable, dropped, kept: derive(rules, stable) }
}

function isDropped(rules: NormalizeRules, reading: Reading): boolean {
  return DROP_RULES.some(drops.bind(null, rules, reading))
}

function drops(rules: NormalizeRules, reading: Reading, rule: DropRule): boolean {
  return rule(rules, reading)
}

function dropsUnstable(rules: NormalizeRules, reading: Reading): boolean {
  return rules.dropUnstable === true && reading.status === "unstable"
}

/** The unretained peak, such as the solvent front or the air: a peak that comes off the column before the limit. */
function elutesTooEarly(rules: NormalizeRules, reading: Reading): boolean {
  const minutes = reading.extras["minutes"]
  return rules.dropBeforeMinutes !== undefined && typeof minutes === "number" && minutes < rules.dropBeforeMinutes
}

/** A result strip that prints several values, of which the lab wants one. */
function isOtherQuantity(rules: NormalizeRules, reading: Reading): boolean {
  return rules.keepQuantity !== undefined && reading.quantity !== rules.keepQuantity
}

/** The first derivation that the device asks for. With none, every settled reading is delivered. */
function derive(rules: NormalizeRules, stable: Reading[]): Reading[] {
  return DERIVATIONS.map(derivation.bind(null, rules, stable)).find(isDerived) ?? stable
}

function derivation(rules: NormalizeRules, stable: Reading[], rule: Derivation): Reading[] | null {
  return rule(rules, stable)
}

function isDerived(kept: Reading[] | null): kept is Reading[] {
  return kept !== null
}

function fromDifference(rules: NormalizeRules, stable: Reading[]): Reading[] | null {
  return rules.byDifference ? byDifference(rules.byDifference.quantity, stable) : null
}

function fromPurity(rules: NormalizeRules, stable: Reading[]): Reading[] | null {
  return rules.purity ? purity(rules.purity.quantity, stable) : null
}

function fromLast(rules: NormalizeRules, stable: Reading[]): Reading[] | null {
  return rules.keepLast === true ? stable.slice(-1) : null
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

import type { NormalizeRules } from "../registry/schema"
import type { Normalized, Reading } from "./types"
import { round } from "./numbers"

type Scale = NonNullable<NormalizeRules["scale"]>

/** Apply the device's rules in order: stability filter, unit scale, alarm flag. */
export function normalize(rules: NormalizeRules, readings: Reading[]): Normalized {
  const unstable = rules.dropUnstable ? readings.filter(isUnstable) : []
  const kept = readings.filter(isKept.bind(null, unstable)).map(applyRules.bind(null, rules))
  return { kept, dropped: unstable }
}

function applyRules(rules: NormalizeRules, reading: Reading): Reading {
  const scaled = rules.scale ? scaleReading(rules.scale, reading) : reading
  return { ...scaled, alarm: rules.alarmAbove !== undefined && scaled.value > rules.alarmAbove }
}

function scaleReading(scale: Scale, reading: Reading): Reading {
  const fraction = (reading.value - scale.fromMin) / (scale.fromMax - scale.fromMin)
  const value = round(scale.toMin + fraction * (scale.toMax - scale.toMin), 2)
  return { ...reading, value, unit: scale.unit }
}

function isUnstable(reading: Reading): boolean {
  return reading.status === "unstable"
}

function isKept(dropped: Reading[], reading: Reading): boolean {
  return !dropped.includes(reading)
}

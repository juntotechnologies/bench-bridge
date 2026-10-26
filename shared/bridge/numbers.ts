/** Pure number helpers: rounding, leading-number parsing and the digits an instrument prints. */
import type { Reading } from "./types"

const NUMBER = /^[-+]?\d+(\.\d+)?$/

export function round(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

/** A value whose first token is a number reads as that number; anything else stays text. */
export function leadingNumberOrText(value: string): number | string {
  const first = value.trim().split(/\s+/)[0] ?? ""
  return NUMBER.test(first) ? Number(first) : value.trim()
}

/** Digits after the decimal point in a printed number. */
export function decimalPlaces(text: string): number {
  return text.split(".")[1]?.length ?? 0
}

/** The value with the decimals the instrument prints. */
export function printed(reading: Reading): string {
  return reading.value.toFixed(reading.places)
}

/** Builds a typed reading from parsed values. */
import type { Extra, Reading } from "../types"

type ReadingCore = Pick<Reading, "quantity" | "value" | "unit" | "takenAt" | "sampleId">

export function makeReading(core: ReadingCore, extras: Record<string, Extra> = {}, stable = true): Reading {
  return { ...core, status: stable ? "stable" : "unstable", extras }
}


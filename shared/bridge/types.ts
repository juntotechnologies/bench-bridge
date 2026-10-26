/** Data shapes that move through the pure bridge pipeline, from a captured line to a normalized reading. */
import type { MappedRecord } from "../contracts"

export type { FieldValue, MappedRecord, Receipt } from "../contracts"

export type Extra = string | number

export interface CapturedLine {
  at: string
  text: string
}

export interface Reading {
  quantity: string
  value: number
  unit: string
  /** Decimal places the instrument prints. */
  places: number
  takenAt: string
  sampleId: string
  status: "stable" | "unstable"
  extras: Record<string, Extra>
}

export interface Normalized {
  /** Readings that passed every drop rule, before any derived reading. */
  stable: Reading[]
  dropped: Reading[]
  /** What the bridge maps and delivers. */
  kept: Reading[]
}

export interface BridgeRun {
  captured: CapturedLine[]
  readings: Reading[]
  normalized: Normalized
  mapped: MappedRecord[]
}

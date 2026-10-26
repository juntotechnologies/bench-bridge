import type { TargetId } from "../registry/schema"

export type Extra = string | number

export interface CapturedLine {
  at: string
  text: string
}

export interface Reading {
  quantity: string
  value: number
  unit: string
  takenAt: string
  sampleId: string
  status: "stable" | "unstable"
  extras: Record<string, Extra>
}

export interface Normalized {
  /** Readings that passed the stability rule, before any derived reading. */
  stable: Reading[]
  dropped: Reading[]
  /** What the bridge maps and delivers. */
  kept: Reading[]
}

export type FieldValue = string | number | boolean

export interface MappedRecord {
  target: TargetId
  readingIndex: number
  fields: Record<string, FieldValue>
}

export interface Receipt {
  target: TargetId
  readingIndex: number
  accepted: boolean
  ref: string | null
  at: string
  missing: string[]
}

export interface DeliveryDeps {
  now: () => string
  nextRef: (prefix: string) => string
}

export interface BridgeRun {
  captured: CapturedLine[]
  readings: Reading[]
  normalized: Normalized
  mapped: MappedRecord[]
  receipts: Receipt[]
}

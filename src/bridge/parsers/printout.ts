import type { CapturedLine, Extra, Reading } from "../types"
import { leadingNumberOrText } from "../numbers"
import { makeReading } from "./reading"

export interface PrintoutConfig {
  sampleKey: string
  primary: { key: string; quantity: string; unit: string }
  extras: Record<string, string>
}

interface Field {
  value: string
  at: string
}

const KEY_VALUE = /^(\S+)\s+(.+)$/

/** A printed report block: one "KEY value" pair per line, one reading per block. */
export function parsePrintout(config: PrintoutConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  const fields = new Map(lines.flatMap(toField))
  const primary = fields.get(config.primary.key)
  if (!primary) return []
  const value = leadingNumberOrText(primary.value)
  if (typeof value !== "number") return []
  const core = { quantity: config.primary.quantity, value, unit: config.primary.unit, takenAt: primary.at }
  const sample = fields.get(config.sampleKey)?.value ?? sampleId
  return [makeReading({ ...core, sampleId: sample }, extrasFrom(config.extras, fields))]
}

function toField(line: CapturedLine): [string, Field][] {
  const match = KEY_VALUE.exec(line.text.trim())
  return match ? [[match[1] as string, { value: match[2] as string, at: line.at }]] : []
}

function extrasFrom(keys: Record<string, string>, fields: Map<string, Field>): Record<string, Extra> {
  return Object.fromEntries(Object.entries(keys).flatMap(extraEntry.bind(null, fields)))
}

function extraEntry(fields: Map<string, Field>, [key, name]: [string, string]): [string, Extra][] {
  const field = fields.get(key)
  return field ? [[name, leadingNumberOrText(field.value)]] : []
}

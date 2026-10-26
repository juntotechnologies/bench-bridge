import type { CapturedLine, Reading } from "../types"
import { makeReading } from "./reading"

export interface PlateConfig {
  quantity: string
  unit: string
}

const ROW = /^([A-H])\s+(.+)$/

/** An 8 × 12 text grid: one row letter, then one value per column. */
export function parsePlateMatrix(config: PlateConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parseRow.bind(null, config, sampleId))
}

function parseRow(config: PlateConfig, sampleId: string, line: CapturedLine): Reading[] {
  const match = ROW.exec(line.text.trim())
  if (!match) return []
  const context = { config, sampleId, row: match[1] as string, at: line.at }
  return (match[2] as string).trim().split(/\s+/).map(wellReading.bind(null, context))
}

interface RowContext {
  config: PlateConfig
  sampleId: string
  row: string
  at: string
}

function wellReading(context: RowContext, value: string, column: number): Reading {
  const { config, sampleId, row, at } = context
  const core = { quantity: config.quantity, value: Number(value), unit: config.unit, takenAt: at, sampleId }
  return makeReading(core, { well: `${row}${column + 1}` })
}

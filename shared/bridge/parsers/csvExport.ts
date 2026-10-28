/** Parser for a results file that a data system exports as comma-separated values: one header row, then one row for each analyte. */
import type { CapturedLine, Reading } from "../types"
import { decimalPlaces } from "../numbers"
import { makeReading } from "./reading"

/** The header text of each column that the bridge reads. */
export interface CsvColumns {
  sample: string
  analyte: string
  area: string
  isArea: string
  value: string
}

export interface CsvConfig {
  /** The unit of the value column, such as "ng/mL". */
  unit: string
  columns: CsvColumns
}

type ColumnIndex = Record<keyof CsvColumns, number>

const SEPARATOR = ","
const NUMBER = /^-?\d+(?:\.\d+)?$/

/** Rows such as "S-2026-0440,Fentanyl,184220,95310,12.40". The first line names the columns. A row without a number in the value column is skipped. */
export function parseCsvExport(config: CsvConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  const [header, ...rows] = lines
  if (!header) return []
  const index = columnIndex(config.columns, cells(header.text))
  return rows.flatMap(parseRow.bind(null, { unit: config.unit, index, sampleId }))
}

interface RowContext {
  unit: string
  index: ColumnIndex
  sampleId: string
}

function cells(text: string): string[] {
  return text.split(SEPARATOR).map(trimmed)
}

function trimmed(text: string): string {
  return text.trim()
}

function columnIndex(columns: CsvColumns, header: string[]): ColumnIndex {
  return Object.fromEntries(Object.entries(columns).map(indexEntry.bind(null, header))) as ColumnIndex
}

function indexEntry(header: string[], [key, name]: [string, string]): [string, number] {
  return [key, header.indexOf(name)]
}

function parseRow(context: RowContext, line: CapturedLine): Reading[] {
  const row = cells(line.text)
  return NUMBER.test(cellAt(row, context.index.value)) ? [rowReading(context, row, line.at)] : []
}

/** One reading from a row whose value column holds a number. The row's own sample wins over the capture's. */
function rowReading({ unit, index, sampleId }: RowContext, row: string[], takenAt: string): Reading {
  const value = cellAt(row, index.value)
  const core = { quantity: cellAt(row, index.analyte), value: Number(value), unit, places: decimalPlaces(value), takenAt, sampleId: cellAt(row, index.sample) || sampleId }
  return makeReading(core, { area: Number(cellAt(row, index.area)), isArea: Number(cellAt(row, index.isArea)) })
}

function cellAt(row: string[], index: number): string {
  return row[index] ?? ""
}

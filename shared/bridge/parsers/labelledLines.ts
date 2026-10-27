/** Parser for result strips: one line for each value, written as a label, a value and a unit. */
import type { CapturedLine, Reading } from "../types"
import { decimalPlaces } from "../numbers"
import { makeReading } from "./reading"

export interface LabelledConfig {
  /** The labels the instrument prints. A line with any other label is not a reading. */
  labels: string[]
}

const LABELLED = /^(\S.*?)\s{2,}(-?\d+(?:\.\d+)?)\s+(\S+)$/

/** Lines such as "Water   0.412  %". The label and the value are at least two spaces apart. */
export function parseLabelledLines(config: LabelledConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parseLabelledLine.bind(null, config.labels, sampleId))
}

function parseLabelledLine(labels: string[], sampleId: string, line: CapturedLine): Reading[] {
  const match = LABELLED.exec(line.text.trim())
  if (!match) return []
  const [, label, value, unit] = match as unknown as [string, string, string, string]
  if (!labels.includes(label)) return []
  const core = { quantity: label, value: Number(value), unit, places: decimalPlaces(value), takenAt: line.at, sampleId }
  return [makeReading(core)]
}

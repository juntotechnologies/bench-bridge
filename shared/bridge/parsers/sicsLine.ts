/** Parser for balance weight lines in the S S or S D print format. */
import type { CapturedLine, Reading } from "../types"
import { makeReading } from "./reading"

export interface SicsConfig {
  quantity: string
}

const WEIGHT = /^S\s+([SD])\s+(-?\d+\.\d+)\s+(\S+)$/

/** Weight lines in the "S S <value> <unit>" form: S is stable, D is still moving. */
export function parseSicsLines(config: SicsConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parseSicsLine.bind(null, config.quantity, sampleId))
}

function parseSicsLine(quantity: string, sampleId: string, line: CapturedLine): Reading[] {
  const match = WEIGHT.exec(line.text.trim())
  if (!match) return []
  const [, flag, value, unit] = match as unknown as [string, string, string, string]
  return [makeReading({ quantity, value: Number(value), unit, takenAt: line.at, sampleId }, {}, flag === "S")]
}

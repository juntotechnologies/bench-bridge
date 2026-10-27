/** Parser for the print lines of a pH meter: the pH, the temperature and a mark that says whether the value has settled. */
import type { CapturedLine, Reading } from "../types"
import { decimalPlaces } from "../numbers"
import { makeReading } from "./reading"

export interface PhConfig {
  quantity: string
  unit: string
}

const PH_LINE = /^pH\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)C\s+(READY|DRIFT)$/
const SETTLED = "READY"

/** Lines such as "pH 7.02 25.1C READY". READY is a settled value. DRIFT is a value that still moves. */
export function parsePhLines(config: PhConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parsePhLine.bind(null, config, sampleId))
}

function parsePhLine(config: PhConfig, sampleId: string, line: CapturedLine): Reading[] {
  const match = PH_LINE.exec(line.text.trim())
  if (!match) return []
  const [, value, temperature, mark] = match as unknown as [string, string, string, string]
  const core = { quantity: config.quantity, value: Number(value), unit: config.unit, places: decimalPlaces(value), takenAt: line.at, sampleId }
  return [makeReading(core, { temperature: Number(temperature) }, mark === SETTLED)]
}

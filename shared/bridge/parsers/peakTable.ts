/** Parser for the peak rows of a chromatography data system report: retention time, area, area percent and name. */
import type { CapturedLine, Reading } from "../types"
import { decimalPlaces } from "../numbers"
import { roleOf, type PeakRoles } from "../peaks"
import { makeReading } from "./reading"

export interface PeakConfig extends PeakRoles {
  /** The unit of the value column: "%" for an area percent, "ppm" for a concentration. */
  unit: string
}

const PEAK = /^\s*\d+\s+(\d+\.\d+)\s+(\d+)\s+(\d+\.\d+)\s+(.+?)\s*$/

/** Rows such as "2  4.37  287650  98.10  Codeine phosphate". Title and header lines are skipped. */
export function parsePeakTable(config: PeakConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parsePeakLine.bind(null, config, sampleId))
}

function parsePeakLine(config: PeakConfig, sampleId: string, line: CapturedLine): Reading[] {
  const match = PEAK.exec(line.text)
  if (!match) return []
  const [, minutes, area, percent, name] = match as unknown as [string, string, string, string, string]
  const core = { quantity: name, value: Number(percent), unit: config.unit, places: decimalPlaces(percent), takenAt: line.at, sampleId }
  return [makeReading(core, { minutes: Number(minutes), area: Number(area), role: roleOf(config, name) })]
}

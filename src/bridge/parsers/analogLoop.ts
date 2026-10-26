import type { CapturedLine, Reading } from "../types"
import { makeReading } from "./reading"

export interface AnalogConfig {
  quantity: string
}

const SAMPLE = /^AI(\d)\s+([\d.]+)\s+mA$/

/** Raw loop current per channel; the normalize rules scale it to the measured unit. */
export function parseAnalogLoop(config: AnalogConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return lines.flatMap(parseSample.bind(null, config.quantity, sampleId))
}

function parseSample(quantity: string, sampleId: string, line: CapturedLine): Reading[] {
  const match = SAMPLE.exec(line.text.trim())
  if (!match) return []
  const core = { quantity, value: Number(match[2]), unit: "mA", takenAt: line.at, sampleId }
  return [makeReading(core, { channel: Number(match[1]) })]
}

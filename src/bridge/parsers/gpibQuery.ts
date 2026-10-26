import type { CapturedLine, Reading } from "../types"
import { round } from "../numbers"
import { makeReading } from "./reading"

export interface GpibConfig {
  quantity: string
  unit: string
  ratio: { numerator: number; denominator: number; quantity: string }
}

const ANSWER = /^<<\s+(\d+(?:\.\d+)?),([-+]?\d*\.\d+)$/

/** Answers to "ABS? <nm>" queries, plus the ratio the registry asks for. */
export function parseGpibQueries(config: GpibConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  const readings = lines.flatMap(parseAnswer.bind(null, config, sampleId))
  return [...readings, ...ratioReading(config, readings)]
}

function parseAnswer(config: GpibConfig, sampleId: string, line: CapturedLine): Reading[] {
  const match = ANSWER.exec(line.text.trim())
  if (!match) return []
  const core = { quantity: config.quantity, value: Number(match[2]), unit: config.unit, takenAt: line.at, sampleId }
  return [makeReading(core, { wavelengthNm: Number(match[1]) })]
}

function ratioReading(config: GpibConfig, readings: Reading[]): Reading[] {
  const top = readings.find(atWavelength.bind(null, config.ratio.numerator))
  const bottom = readings.find(atWavelength.bind(null, config.ratio.denominator))
  if (!top || !bottom || bottom.value === 0) return []
  const value = round(top.value / bottom.value, 2)
  return [makeReading({ ...bottom, quantity: config.ratio.quantity, value, unit: "ratio" })]
}

function atWavelength(nm: number, reading: Reading): boolean {
  return reading.extras["wavelengthNm"] === nm
}

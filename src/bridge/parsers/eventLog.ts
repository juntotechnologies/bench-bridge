import type { CapturedLine, Reading } from "../types"
import { round } from "../numbers"
import { makeReading } from "./reading"

export interface EventLogConfig {
  quantity: string
  unit: string
  runThresholdA: number
}

interface Sample {
  time: string
  amps: number
}

interface Spin {
  start: Sample
  end: Sample
  peakAmps: number
}

const EVENT = /^(\d\d:\d\d:\d\d)\s+lid=(\w+)\s+amps=([\d.]+)$/

/** Retrofit sensor events: a spin runs while the motor current stays above the threshold. */
export function parseEventLog(config: EventLogConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  const spin = findSpin(lines.flatMap(toSample), config.runThresholdA)
  if (!spin) return []
  const day = lines[0]?.at.slice(0, 10)
  const minutes = round((clock(spin.end.time) - clock(spin.start.time)) / 60, 2)
  const core = { quantity: config.quantity, value: minutes, unit: config.unit, sampleId }
  return [makeReading({ ...core, takenAt: `${day}T${spin.end.time}Z` }, { peakAmps: spin.peakAmps })]
}

function findSpin(samples: Sample[], threshold: number): Spin | null {
  const start = samples.findIndex(isAtOrAbove.bind(null, threshold))
  const end = samples.findIndex(isBelowAfter.bind(null, threshold, start))
  if (start < 0 || end < 0) return null
  const peakAmps = Math.max(...samples.slice(start, end).map(ampsOf))
  return { start: samples[start] as Sample, end: samples[end] as Sample, peakAmps }
}

function toSample(line: CapturedLine): Sample[] {
  const match = EVENT.exec(line.text.trim())
  return match ? [{ time: match[1] as string, amps: Number(match[3]) }] : []
}

function isAtOrAbove(threshold: number, sample: Sample): boolean {
  return sample.amps >= threshold
}

function isBelowAfter(threshold: number, start: number, sample: Sample, index: number): boolean {
  return start >= 0 && index > start && sample.amps < threshold
}

function clock(time: string): number {
  const [h, m, s] = time.split(":").map(Number) as [number, number, number]
  return h * 3600 + m * 60 + s
}

function ampsOf(sample: Sample): number {
  return sample.amps
}

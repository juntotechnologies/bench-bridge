/** The chromatogram: one Gaussian curve for each peak of a peak report, drawn against retention time. */
import { copy } from "@shared/registry"
import { printed } from "@shared/bridge/numbers"
import { areaOf, isMainPeak, retentionText } from "@shared/bridge/peaks"
import type { BridgeRun, Reading } from "@shared/bridge/types"
import { ticks } from "./scale"
import type { Chart, KeyItem, Line, LineState, Note, Vec } from "./types"

const SIGMA = 0.12
const SAMPLES_PER_SIGMA = 3
const SPREAD = 4
const HEADROOM = 1.25
const TAIL = SPREAD * SIGMA
const TICK_COUNT = 4
const NOTE_LIFT = -6
const NAME_LIFT = -17
/** A label whose peak is past this share of the axis hangs to the left of the peak, so it stays inside the chart. */
const RIGHT_EDGE = 0.88

interface Peak {
  reading: Reading
  minutes: number
  height: number
  state: LineState
}

/** A Gaussian peak sampled from four sigma before its centre to four sigma after. */
export function peakCurve(centre: number, height: number, sigma: number): Vec[] {
  const half = SPREAD * SAMPLES_PER_SIGMA
  return Array.from({ length: 2 * half + 1 }, sample.bind(null, { centre, height, sigma, half }))
}

interface Sampling {
  centre: number
  height: number
  sigma: number
  half: number
}

function sample(sampling: Sampling, _: unknown, index: number): Vec {
  const offset = (index - sampling.half) / SAMPLES_PER_SIGMA
  return { x: sampling.centre + offset * sampling.sigma, y: sampling.height * Math.exp((-offset * offset) / 2) }
}

export function chromatogram(run: BridgeRun, ruled: boolean): Chart {
  const peaks = peaksOf(run, ruled)
  const last = Math.max(...peaks.map(minutesOf))
  const end = Math.ceil(last + TAIL)
  return {
    title: copy.chart.chromatogram,
    hint: copy.chart.chromatogramHint,
    x: { domain: [0, end], ticks: ticks(0, end, TICK_COUNT), label: copy.chart.minutes },
    y: { domain: [0, HEADROOM], ticks: [], label: copy.chart.signal },
    lines: peaks.map(peakLine),
    dots: [],
    notes: peaks.flatMap(peakNotes.bind(null, { named: !run.readings.some(isMainPeak), end })),
    key: keyOf(peaks),
  }
}

function peaksOf(run: BridgeRun, ruled: boolean): Peak[] {
  const largest = Math.max(...run.readings.map(areaOf))
  return run.readings.map(toPeak.bind(null, run.normalized.dropped, ruled, largest))
}

function toPeak(dropped: Reading[], ruled: boolean, largest: number, reading: Reading): Peak {
  return { reading, minutes: Number(reading.extras["minutes"]), height: areaOf(reading) / largest, state: stateOf(dropped, ruled, reading) }
}

function stateOf(dropped: Reading[], ruled: boolean, reading: Reading): LineState {
  if (ruled && dropped.includes(reading)) return "dropped"
  return isMainPeak(reading) ? "main" : "kept"
}

function peakLine(peak: Peak): Line {
  const title = `${peak.reading.quantity} · ${retentionText(peak.minutes)} ${copy.chart.minutes} · ${shareOf(peak.reading)}`
  return { points: peakCurve(peak.minutes, peak.height, SIGMA), state: peak.state, title }
}

function shareOf(reading: Reading): string {
  return `${printed(reading)} ${reading.unit}`
}

function minutesOf(peak: Peak): number {
  return peak.minutes
}

function stateOfPeak(peak: Peak): LineState {
  return peak.state
}

interface NoteContext {
  /** True for a run with no analyte peak, such as a solvent screen: every peak has a name. */
  named: boolean
  end: number
}

/** A run with no analyte peak names every peak on its own line above its value. A run with one names only that peak. */
function peakNotes(context: NoteContext, peak: Peak): Note[] {
  const share = shareOf(peak.reading)
  if (peak.state === "dropped") return [noteAt(context, peak, copy.chart.dropped, NOTE_LIFT)]
  if (context.named) return [noteAt(context, peak, peak.reading.quantity, NAME_LIFT), noteAt(context, peak, share, NOTE_LIFT)]
  return [noteAt(context, peak, peak.state === "main" ? `${peak.reading.quantity} ${share}` : share, NOTE_LIFT)]
}

function noteAt(context: NoteContext, peak: Peak, text: string, lift: number): Note {
  const anchor = peak.minutes > context.end * RIGHT_EDGE ? "end" : "middle"
  return { at: { x: peak.minutes, y: peak.height }, text, anchor, lift }
}

function isPresent(present: Set<LineState>, item: KeyItem): boolean {
  return present.has(item.swatch)
}

function keyOf(peaks: Peak[]): KeyItem[] {
  const present = new Set(peaks.map(stateOfPeak))
  const items: KeyItem[] = [{ label: copy.chart.main, swatch: "main" }, { label: copy.chart.kept, swatch: "kept" }, { label: copy.chart.dropped, swatch: "dropped" }]
  return items.filter(isPresent.bind(null, present))
}

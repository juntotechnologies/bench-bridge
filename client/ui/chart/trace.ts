/** The weight trace: each weight the balance printed, against seconds since the first line. */
import { copy } from "@shared/registry"
import { printed } from "@shared/bridge/numbers"
import type { BridgeRun, Reading } from "@shared/bridge/types"
import { ticks } from "./scale"
import type { Chart, Dot, KeyItem, Line, Note, Vec } from "./types"

const TICK_COUNT = 4
const Y_TICK_COUNT = 3
const PADDING = 0.35
const FIRST_LIFT = -10
const LAST_LIFT = 15
const MS = 1000

export function weightTrace(run: BridgeRun, ruled: boolean): Chart {
  const start = startOf(run.readings)
  const points = run.readings.map(pointOf.bind(null, start))
  return {
    title: copy.chart.trace,
    hint: copy.chart.traceHint,
    ...axes(run.readings, points),
    lines: [traceLine(points)],
    dots: run.readings.map(dotOf.bind(null, { run, ruled, start })),
    notes: ruled ? edgeNotes(run, start) : [],
    key: keyOf(),
  }
}

function startOf(readings: Reading[]): number {
  return Date.parse(readings[0]?.takenAt ?? "")
}

function axes(readings: Reading[], points: Vec[]): Pick<Chart, "x" | "y"> {
  const [low, high] = padded(readings)
  const end = Math.max(...points.map(secondsOf))
  return {
    x: { domain: [0, end], ticks: ticks(0, end, TICK_COUNT), label: copy.chart.seconds },
    y: { domain: [low, high], ticks: ticks(low, high, Y_TICK_COUNT), label: readings[0]?.unit ?? "" },
  }
}

function pointOf(start: number, reading: Reading): Vec {
  return { x: (Date.parse(reading.takenAt) - start) / MS, y: reading.value }
}

function secondsOf(point: Vec): number {
  return point.x
}

function valueOf(reading: Reading): number {
  return reading.value
}

function padded(readings: Reading[]): [number, number] {
  const values = readings.map(valueOf)
  const low = Math.min(...values)
  const high = Math.max(...values)
  const pad = (high - low) * PADDING || 1
  return [low - pad, high + pad]
}

function traceLine(points: Vec[]): Line {
  return { points, state: "kept", title: copy.chart.trace }
}

interface DotContext {
  run: BridgeRun
  ruled: boolean
  start: number
}

function dotOf(context: DotContext, reading: Reading): Dot {
  const dropped = context.ruled && context.run.normalized.dropped.includes(reading)
  const at = pointOf(context.start, reading)
  return { at, state: dropped ? "dropped" : "kept", title: `${printed(reading)} ${reading.unit} · ${at.x.toFixed(1)} ${copy.chart.seconds}` }
}

/** The first and the last weight that count, which the arithmetic subtracts. */
function edgeNotes(run: BridgeRun, start: number): Note[] {
  const first = run.normalized.stable[0]
  const last = run.normalized.stable.at(-1)
  if (!first || !last || first === last) return []
  return [noteFor(first, start, "start", FIRST_LIFT), noteFor(last, start, "end", LAST_LIFT)]
}

function noteFor(reading: Reading, start: number, anchor: Note["anchor"], lift: number): Note {
  return { at: pointOf(start, reading), text: `${printed(reading)} ${reading.unit}`, anchor, lift }
}

function keyOf(): KeyItem[] {
  return [{ label: copy.chart.kept, swatch: "kept" }, { label: copy.chart.dropped, swatch: "dropped" }]
}

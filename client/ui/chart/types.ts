/** The data shapes of a chart: a model that a builder makes from a run and render.ts draws. */
export interface Vec {
  x: number
  y: number
}

export interface Tick {
  at: number
  label: string
}

export interface Axis {
  domain: [number, number]
  ticks: Tick[]
  label: string
}

export type LineState = "main" | "kept" | "dropped"
export type DotState = "kept" | "dropped"
export type Anchor = "start" | "middle" | "end"

export interface Line {
  points: Vec[]
  state: LineState
  title: string
}

export interface Dot {
  at: Vec
  state: DotState
  title: string
}

/** A text label next to a mark. `lift` moves it up (negative) or down (positive) by pixels. */
export interface Note {
  at: Vec
  text: string
  anchor: Anchor
  lift: number
}

export interface KeyItem {
  label: string
  swatch: LineState
}

export interface Chart {
  title: string
  hint: string
  x: Axis
  y: Axis
  lines: Line[]
  dots: Dot[]
  notes: Note[]
  key: KeyItem[]
}

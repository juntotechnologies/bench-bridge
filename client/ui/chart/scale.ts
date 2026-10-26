/** Chart scales: a linear map from data to pixels, and clean ticks for an axis. */
import type { Tick } from "./types"

export type Scale = (value: number) => number

interface Mapping {
  domain: [number, number]
  range: [number, number]
}

export function linear(domain: [number, number], range: [number, number]): Scale {
  return project.bind(null, { domain, range })
}

function project(mapping: Mapping, value: number): number {
  const [d0, d1] = mapping.domain
  const [r0, r1] = mapping.range
  if (d0 === d1) return (r0 + r1) / 2
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)
}

/** Ticks at 1, 2 or 5 times a power of ten, all inside the domain, labelled with the digits the step needs. */
export function ticks(min: number, max: number, count: number): Tick[] {
  const step = niceStep((max - min) / count)
  const places = Math.max(0, -Math.floor(Math.log10(step)))
  const first = Math.ceil(min / step - EPSILON)
  const last = Math.floor(max / step + EPSILON)
  return Array.from({ length: last - first + 1 }, tickAt.bind(null, { first, step, places }))
}

const EPSILON = 1e-9

interface Spacing {
  first: number
  step: number
  places: number
}

function tickAt(spacing: Spacing, _: unknown, index: number): Tick {
  const at = Number(((spacing.first + index) * spacing.step).toFixed(spacing.places))
  return { at, label: at.toFixed(spacing.places) }
}

const STEP_FRACTIONS = [1, 2, 5, 10]

function niceStep(raw: number): number {
  const power = 10 ** Math.floor(Math.log10(raw))
  const fraction = STEP_FRACTIONS.find(atLeast.bind(null, raw / power)) ?? 10
  return fraction * power
}

function atLeast(value: number, fraction: number): boolean {
  return value <= fraction
}

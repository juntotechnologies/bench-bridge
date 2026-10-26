/** Spacing motion: steps the drawing between assembled and exploded, one rendered frame at a time. */
import type { Schedule } from "./runner"
import type { AppState, Store } from "./store"

export const SPACING_STEP = 0.1
const FRAME_MS = 45
const SETTLED = [0, 1]

/** Anything that can draw a frame: the drawing client in the app, a fake in tests. */
export interface Painter {
  draw(deviceId: string, explosion: number, annotate: boolean): Promise<string>
}

/** Counts the moves; a move that is no longer the newest stops at its next step. */
export interface Motion {
  run: number
}

export interface MotionDeps {
  painter: Painter
  schedule: Schedule
  motion: Motion
}

export type Spacing = Pick<AppState, "explosion" | "labels">

/** Labels show only at rest: mid-move frames skip them, as the teardown viewer does. */
export function annotates(spacing: Spacing): boolean {
  return spacing.labels && SETTLED.includes(spacing.explosion)
}

/** The slider stops, nearest to the given spacing first, so a move renders its frames in the order it shows them. */
export function stopsNearest(from: number): number[] {
  return spacingStops().sort(byDistanceFrom.bind(null, from))
}

/** Asks for every frame of a device up front, so a move later finds them drawn. */
export function prewarm(painter: Painter, deviceId: string, from: number): void {
  for (const explosion of stopsNearest(from)) void painter.draw(deviceId, explosion, false)
  for (const explosion of SETTLED) void painter.draw(deviceId, explosion, true)
}

/** Step the spacing one stop at a time. A step waits for its frame, so a slow draw delays the move and never drops a frame. */
export function animateTo(store: Store, deps: MotionDeps, target: number): void {
  cancelMotion(deps.motion)
  void step(store, deps, target, deps.motion.run)
}

/** Stops the running move at its next step, for example when the user takes the slider. */
export function cancelMotion(motion: Motion): void {
  motion.run += 1
}

async function step(store: Store, deps: MotionDeps, target: number, run: number): Promise<void> {
  const current = store.get().explosion
  if (current === target || deps.motion.run !== run) return
  const next = stopBy(current, Math.sign(target - current))
  await Promise.all([frame(store.get(), deps.painter, next), beat(deps.schedule)])
  if (deps.motion.run !== run) return
  store.set({ explosion: next })
  await step(store, deps, target, run)
}

/** Draws the frame that the next step shows. A failure is logged where the stage paints it, so it is ignored here. */
function frame(state: AppState, painter: Painter, explosion: number): Promise<string | null> {
  return painter.draw(state.deviceId, explosion, annotates({ ...state, explosion })).catch(ignoreFailure)
}

function ignoreFailure(): null {
  return null
}

function beat(schedule: Schedule): Promise<void> {
  return new Promise<void>(waitOne.bind(null, schedule))
}

function waitOne(schedule: Schedule, resolve: () => void): void {
  schedule(resolve, FRAME_MS)
}

function stopAt(index: number): number {
  return Math.round(index * SPACING_STEP * 100) / 100
}

function stopBy(from: number, direction: number): number {
  return stopAt(Math.round(from / SPACING_STEP) + direction)
}

function spacingStops(): number[] {
  return Array.from({ length: Math.round(1 / SPACING_STEP) + 1 }, stopAtIndex)
}

function stopAtIndex(_: unknown, index: number): number {
  return stopAt(index)
}

function byDistanceFrom(from: number, a: number, b: number): number {
  return Math.abs(a - from) - Math.abs(b - from)
}

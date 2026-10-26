/** Tests for the spacing motion: every stop shows in order, slow frames never get skipped, and the newest move wins. */
import { describe, expect, it } from "vitest"
import { animateTo, annotates, cancelMotion, stopsNearest, type Motion, type MotionDeps, type Painter } from "@client/ui/motion"
import { IDLE_RUN, Store, type AppState } from "@client/ui/store"

const INITIAL: AppState = { deviceId: "hplc", tab: "overview", pane: "stage", explosion: 1, labels: true, zoom: 1, catalogFilter: "all", ...IDLE_RUN }

interface Call {
  explosion: number
  annotate: boolean
}

interface Rig {
  store: Store
  deps: MotionDeps
  calls: Call[]
  beats: Array<() => void>
  shown: number[]
}

function rig(draw: Painter["draw"]): Rig {
  const store = new Store(INITIAL)
  const calls: Call[] = []
  const beats: Array<() => void> = []
  const shown: number[] = []
  const painter: Painter = { draw: (id, explosion, annotate) => (calls.push({ explosion, annotate }), draw(id, explosion, annotate)) }
  const motion: Motion = { run: 0 }
  store.subscribe((state) => shown.push(state.explosion))
  return { store, deps: { painter, motion, schedule: (callback: () => void) => void beats.push(callback) }, calls, beats, shown }
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/** Runs every scheduled beat until none is left. */
async function drain(rigged: Rig): Promise<void> {
  await settle()
  while (rigged.beats.length) {
    rigged.beats.shift()?.()
    await settle()
  }
}

const instant: Painter["draw"] = async () => "<g/>"

describe("stopsNearest", () => {
  it("starts at the current spacing and walks away from it", () => {
    expect(stopsNearest(1)).toEqual([1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0])
    expect(stopsNearest(0)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
  })

  it("lists every stop once from a middle spacing", () => {
    const stops = stopsNearest(0.5)
    expect(stops[0]).toBe(0.5)
    expect([...stops].sort()).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
  })
})

describe("annotates", () => {
  it("draws labels only at rest, and only when labels are on", () => {
    expect([0, 0.5, 1].map((explosion) => annotates({ labels: true, explosion }))).toEqual([true, false, true])
    expect(annotates({ labels: false, explosion: 0 })).toBe(false)
  })
})

describe("animateTo", () => {
  it("shows every stop on the way, in order, and ends at the target", async () => {
    const rigged = rig(instant)
    animateTo(rigged.store, rigged.deps, 0)
    await drain(rigged)
    expect(rigged.shown).toEqual([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0])
  })

  it("asks for labels only on the frame at rest", async () => {
    const rigged = rig(instant)
    animateTo(rigged.store, rigged.deps, 0)
    await drain(rigged)
    expect(rigged.calls.filter((call) => call.annotate)).toEqual([{ explosion: 0, annotate: true }])
  })

  it("waits for a slow frame instead of skipping it", async () => {
    const releases: Array<() => void> = []
    const slow: Painter["draw"] = () => new Promise((resolve) => releases.push(() => resolve("<g/>")))
    const rigged = rig(slow)
    animateTo(rigged.store, rigged.deps, 0)
    await drain(rigged)
    expect(rigged.shown).toEqual([])
    releases.shift()?.()
    await drain(rigged)
    expect(rigged.shown).toEqual([0.9])
  })

  it("still reaches the target when a frame fails to draw", async () => {
    const rigged = rig(async () => Promise.reject(new Error("worker down")))
    animateTo(rigged.store, rigged.deps, 0)
    await drain(rigged)
    expect(rigged.store.get().explosion).toBe(0)
  })

  it("lets the newest move win", async () => {
    const rigged = rig(instant)
    animateTo(rigged.store, rigged.deps, 0)
    await settle()
    rigged.beats.shift()?.()
    await settle()
    animateTo(rigged.store, rigged.deps, 1)
    await drain(rigged)
    expect(rigged.shown).toEqual([0.9, 1])
  })

  it("stops at the next step when the move is cancelled", async () => {
    const rigged = rig(instant)
    animateTo(rigged.store, rigged.deps, 0)
    await settle()
    rigged.beats.shift()?.()
    await settle()
    cancelMotion(rigged.deps.motion)
    await drain(rigged)
    expect(rigged.shown).toEqual([0.9])
  })

  it("does nothing when already at the target", async () => {
    const rigged = rig(instant)
    animateTo(rigged.store, rigged.deps, 1)
    await drain(rigged)
    expect(rigged.shown).toEqual([])
  })
})

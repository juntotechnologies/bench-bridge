/** Server-owned clock and reference numbers: each accepted record gets the next number for its target. */
import type { DeliveryDeps } from "./deliver"

const WIDTH = 6

export function createDeps(): DeliveryDeps {
  const counters = new Map<string, number>()
  return { now: nowIso, nextRef: nextRef.bind(null, counters) }
}

function nowIso(): string {
  return new Date().toISOString()
}

function nextRef(counters: Map<string, number>, prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1
  counters.set(prefix, next)
  return `${prefix}-${String(next).padStart(WIDTH, "0")}`
}

import { deviceById, stages, targets } from "../registry"
import type { Device } from "../registry/schema"
import { runBridge } from "../bridge/pipeline"
import type { BridgeRun, DeliveryDeps, Receipt } from "../bridge/types"
import { logEvent } from "../log"
import type { Store } from "./store"

export const STAGE_MS = 900

export type Schedule = (callback: () => void, delayMs: number) => void

/** Run the whole pipeline at once, then reveal one stage per beat so the viewer can follow it. */
export function startRun(store: Store, deps: DeliveryDeps, schedule: Schedule): void {
  const device = deviceById(store.get().deviceId) as Device
  const run = runBridge(device, targets, deps)
  run.receipts.filter(isRejected).forEach(logRejection.bind(null, device))
  store.set({ run, revealed: 1, tab: "data" })
  for (let stage = 2; stage <= stages.length; stage++) schedule(reveal.bind(null, store, run, stage), (stage - 1) * STAGE_MS)
}

function reveal(store: Store, run: BridgeRun, stage: number): void {
  if (store.get().run !== run) return
  store.set({ revealed: stage, tab: stage >= stages.length - 1 ? "deliver" : "data" })
}

function isRejected(receipt: Receipt): boolean {
  return !receipt.accepted
}

function logRejection(device: Device, receipt: Receipt): void {
  const fields = { deviceId: device.id, target: receipt.target, readingIndex: receipt.readingIndex, missing: receipt.missing.join(",") }
  logEvent("delivery.rejected", fields, "warn")
}

let sequence = 0

/** Plain-HTTP safe: crypto.getRandomValues works on insecure origins, randomUUID does not. */
export function nextRef(prefix: string): string {
  sequence += 1
  const salt = crypto.getRandomValues(new Uint16Array(1))[0] ?? 0
  return `${prefix}-${salt.toString(16).toUpperCase().padStart(4, "0")}${String(sequence).padStart(3, "0")}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

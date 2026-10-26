/** Runs the bridge: shared pipeline in the browser, delivery on the server, one stage revealed per beat. */
import { deviceById, stages } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { runBridge } from "@shared/bridge/pipeline"
import type { BridgeRun } from "@shared/bridge/types"
import type { DeliverResponse } from "@shared/contracts"
import { logEvent } from "@shared/log"
import { postDeliver, type Send } from "../api"
import type { Store } from "./store"

export const STAGE_MS = 900
const LAST_LOCAL_STAGE = 4

export type Schedule = (callback: () => void, delayMs: number) => void

export interface RunDeps {
  send: Send
  schedule: Schedule
}

export function startRun(store: Store, deps: RunDeps): void {
  const device = deviceById(store.get().deviceId) as Device
  const run = runBridge(device)
  store.set({ run, delivery: null, failed: false, revealed: 1, tab: "data" })
  const pending = postDeliver(deps.send, { deviceId: device.id, records: run.mapped }).catch(logFailure.bind(null, device.id))
  for (let stage = 2; stage <= LAST_LOCAL_STAGE; stage++) deps.schedule(reveal.bind(null, store, run, stage), (stage - 1) * STAGE_MS)
  deps.schedule(finish.bind(null, store, run, pending), LAST_LOCAL_STAGE * STAGE_MS)
}

function reveal(store: Store, run: BridgeRun, stage: number): void {
  if (store.get().run !== run) return
  store.set({ revealed: stage, tab: stage >= LAST_LOCAL_STAGE ? "deliver" : "data" })
}

async function finish(store: Store, run: BridgeRun, pending: Promise<DeliverResponse | null>): Promise<void> {
  const delivery = await pending
  if (store.get().run !== run) return
  store.set({ delivery, failed: delivery === null, revealed: stages.length, tab: "deliver" })
}

function logFailure(deviceId: string, error: unknown): null {
  logEvent("delivery.request_failed", { deviceId, message: String(error) }, "error")
  return null
}

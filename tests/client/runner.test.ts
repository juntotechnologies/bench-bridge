/** Tests for the client run flow: stages reveal in order and the server response lands in the store. */
import { describe, expect, it } from "vitest"
import type { DeliverResponse } from "@shared/contracts"
import { startRun, type Schedule } from "@client/ui/runner"
import { IDLE_RUN, Store, type AppState } from "@client/ui/store"

const INITIAL: AppState = { deviceId: "balance", tab: "overview", pane: "stage", explosion: 1, labels: true, zoom: 1, catalogFilter: "all", ...IDLE_RUN }
const RESPONSE: DeliverResponse = { receipts: [], ledger: null }

interface Collector {
  callbacks: Array<() => void>
  schedule: Schedule
}

function collector(): Collector {
  const callbacks: Array<() => void> = []
  return { callbacks, schedule: (callback: () => void) => void callbacks.push(callback) }
}

const now = (): number => 1_000

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe("startRun", () => {
  it("stamps the start time from the clock it is given", () => {
    const store = new Store(INITIAL)
    const send = async (): Promise<Response> => new Response(JSON.stringify(RESPONSE))
    startRun(store, { send, schedule: collector().schedule, now })
    expect(store.get().startedAt).toBe(1_000)
  })

  it("reveals the first stage at once and the rest on the schedule", async () => {
    const store = new Store(INITIAL)
    const { callbacks, schedule } = collector()
    const send = async (): Promise<Response> => new Response(JSON.stringify(RESPONSE))
    startRun(store, { send, schedule, now })
    expect(store.get()).toMatchObject({ revealed: 1, tab: "data", pane: "inspector" })
    callbacks.forEach((callback) => callback())
    await settle()
    expect(store.get()).toMatchObject({ revealed: 5, tab: "deliver", failed: false, delivery: RESPONSE })
  })

  it("marks the run failed when the server does not answer", async () => {
    const store = new Store(INITIAL)
    const { callbacks, schedule } = collector()
    const send = async (): Promise<Response> => new Response("{}", { status: 500 })
    startRun(store, { send, schedule, now })
    callbacks.forEach((callback) => callback())
    await settle()
    expect(store.get()).toMatchObject({ revealed: 5, failed: true, delivery: null })
  })
})

/** Tests for the server: delivery receipts, the ledger line, request validation and the container drift check. */
import { describe, expect, it } from "vitest"
import { runBridge } from "@shared/bridge/pipeline"
import { DeliverResponse, type MappedRecord } from "@shared/contracts"
import { deviceById, devices, targets } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { containerByRef } from "@server/containers"
import { deliver, type DeliveryDeps } from "@server/deliver"
import { handleDeliver } from "@server/handler"
import { ledgerLine } from "@server/ledger"
import { createDeps } from "@server/refs"

const balance = deviceById("balance") as Device
const fixedDeps: DeliveryDeps = { now: () => "2026-10-26T15:00:00.000Z", nextRef: (prefix: string) => `${prefix}-0001` }

describe("deliver", () => {
  it("accepts a record with every required field", () => {
    const fields = { container_ref: "A", quantity_used: 1, unit: "g", used_at: "t", instrument_id: "EQ" }
    const [receipt] = deliver(targets, [{ target: "ledger", readingIndex: 0, fields }], fixedDeps)
    expect(receipt).toEqual({ target: "ledger", readingIndex: 0, accepted: true, ref: "CSU-0001", at: "2026-10-26T15:00:00.000Z", missing: [] })
  })

  it("rejects a record and names the missing fields", () => {
    const [receipt] = deliver(targets, [{ target: "ledger", readingIndex: 0, fields: { unit: "g" } }], fixedDeps)
    expect(receipt?.accepted).toBe(false)
    expect(receipt?.missing).toEqual(["container_ref", "quantity_used", "used_at", "instrument_id"])
  })
})

describe("createDeps", () => {
  it("numbers references per prefix, in order", () => {
    const deps = createDeps()
    expect([deps.nextRef("RES"), deps.nextRef("RES"), deps.nextRef("CSU")]).toEqual(["RES-000001", "RES-000002", "CSU-000001"])
  })
})

describe("ledgerLine", () => {
  it("draws the container balance down by the amount used", () => {
    const container = containerByRef("CS-0042")
    expect(container && ledgerLine(container, 0.1204)).toMatchObject({ opening: 1.8735, used: 0.1204, closing: 1.7531, unit: "g" })
  })
})

describe("handleDeliver", () => {
  it("delivers the balance run and returns the ledger line", () => {
    const result = handleDeliver(fixedDeps, { deviceId: "balance", records: runBridge(balance).mapped })
    const response = DeliverResponse.parse(result.body)
    expect(response.receipts.map((r) => [r.target, r.accepted])).toEqual([["lims", true], ["ledger", true]])
    expect(response.ledger).toMatchObject({ containerRef: "CS-0042", used: 0.1204, closing: 1.7531 })
  })

  it("rejects a record with missing fields and gives no ledger line", () => {
    const records: MappedRecord[] = [{ target: "ledger", readingIndex: 0, fields: { container_ref: "CS-0042" } }]
    const response = DeliverResponse.parse(handleDeliver(fixedDeps, { deviceId: "balance", records }).body)
    expect(response.receipts[0]?.accepted).toBe(false)
    expect(response.ledger).toBeNull()
  })

  it("answers 400 to a body that is not a deliver request", () => {
    expect(handleDeliver(fixedDeps, { nope: true }).status).toBe(400)
  })
})

describe("ledger drift check", () => {
  it.each(devices.map((d) => [d.id, d] as const))("%s captures against a container in the ledger", (_id, device) => {
    expect(containerByRef(device.capture.containerRef)).toBeDefined()
  })
})

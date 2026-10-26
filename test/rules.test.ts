import { describe, expect, it } from "vitest"
import { normalize } from "../src/bridge/normalize"
import { mapRecords } from "../src/bridge/map"
import { deliver } from "../src/bridge/deliver"
import { ledgerLine } from "../src/bridge/ledger"
import { runBridge } from "../src/bridge/pipeline"
import { containerByRef, deviceById, targets } from "../src/registry"
import type { Container, Device } from "../src/registry/schema"
import type { Reading } from "../src/bridge/types"

const balance = deviceById("balance") as Device
const fixedDeps = { now: () => "2026-10-26T15:00:00.000Z", nextRef: (prefix: string) => `${prefix}-0001` }

function weight(value: number, status: Reading["status"] = "stable"): Reading {
  return { quantity: "Mass", value, unit: "g", takenAt: "2026-10-26T14:02:10.000Z", sampleId: "S-1", status, extras: {} }
}

describe("normalize", () => {
  it("drops unstable readings when the rule says so", () => {
    const result = normalize({ dropUnstable: true }, [weight(1), weight(2, "unstable")])
    expect(result.kept).toEqual([weight(1)])
    expect(result.dropped).toEqual([weight(2, "unstable")])
  })

  it("weighs by difference: first stable weight less the last", () => {
    const { kept } = normalize({ byDifference: { quantity: "Quantity used" } }, [weight(25.4821), weight(25.3617)])
    expect(kept).toEqual([{ ...weight(25.3617), quantity: "Quantity used", value: 0.1204 }])
  })

  it("gives no difference from a single weight", () => {
    expect(normalize({ byDifference: { quantity: "Q" } }, [weight(1)]).kept).toEqual([])
  })
})

describe("mapRecords", () => {
  it("fills fields from reading paths, device paths and constants", () => {
    const [lims, ledger] = mapRecords(balance, [weight(0.1204)])
    expect(lims?.fields).toMatchObject({ sample_ref: "S-1", instrument_id: "EQ-0412", analyte: "Sample weight", result_value: 0.1204 })
    expect(ledger?.fields).toMatchObject({ container_ref: "CS-0042", quantity_used: 0.1204, unit: "g" })
  })

  it("leaves out fields whose path has no value", () => {
    const device = { ...balance, deliveries: [{ target: "lims" as const, fields: { well: "reading.extras.well" } }] }
    expect(mapRecords(device, [weight(1)])[0]?.fields).toEqual({})
  })
})

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

describe("ledgerLine", () => {
  it("draws the container balance down by the amount used", () => {
    const container = containerByRef("CS-0042") as Container
    expect(ledgerLine(container, 0.1204)).toEqual({ opening: 1.8735, used: 0.1204, closing: 1.7531, unit: "g" })
  })
})

describe("runBridge", () => {
  it("turns the balance capture into one accepted LIMS result and one ledger entry", () => {
    const run = runBridge(balance, targets, fixedDeps)
    expect(run.normalized.kept.map((r) => r.value)).toEqual([0.1204])
    expect(run.receipts.map((r) => [r.target, r.accepted])).toEqual([["lims", true], ["ledger", true]])
  })
})

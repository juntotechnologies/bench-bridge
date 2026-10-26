/** Tests for the pure bridge rules: stability filter, weigh by difference, field mapping and the pipeline. */
import { describe, expect, it } from "vitest"
import { normalize } from "@shared/bridge/normalize"
import { mapRecords } from "@shared/bridge/map"
import { runBridge } from "@shared/bridge/pipeline"
import type { Reading } from "@shared/bridge/types"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"

const balance = deviceById("balance") as Device

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

describe("runBridge", () => {
  it("turns the balance capture into one LIMS record and one ledger record", () => {
    const run = runBridge(balance)
    expect(run.normalized.kept.map((r) => r.value)).toEqual([0.1204])
    expect(run.mapped.map((r) => r.target)).toEqual(["lims", "ledger"])
  })
})

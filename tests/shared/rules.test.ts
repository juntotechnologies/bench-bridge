/** Tests for the pure bridge rules: stability filter, weigh by difference, field mapping and the pipeline. */
import { describe, expect, it } from "vitest"
import { normalize } from "@shared/bridge/normalize"
import { mapRecords } from "@shared/bridge/map"
import { runBridge } from "@shared/bridge/pipeline"
import type { Reading } from "@shared/bridge/types"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"

const balance = deviceById("balance") as Device
const hplc = deviceById("hplc") as Device

function weight(value: number, status: Reading["status"] = "stable"): Reading {
  return { quantity: "Mass", value, unit: "g", places: 4, takenAt: "2026-10-26T14:02:10.000Z", sampleId: "S-1", status, extras: {} }
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

  it("keeps the last settled reading when the rule says so", () => {
    const result = normalize({ dropUnstable: true, keepLast: true }, [weight(1, "unstable"), weight(2), weight(3)])
    expect(result.kept).toEqual([weight(3)])
    expect(result.stable).toEqual([weight(2), weight(3)])
  })

  it("keeps one quantity from a strip and drops the others", () => {
    const strip = [{ ...weight(1.2), quantity: "Sample wt" }, { ...weight(0.41), quantity: "Water" }]
    const result = normalize({ keepQuantity: "Water" }, strip)
    expect(result.kept.map((r) => r.quantity)).toEqual(["Water"])
    expect(result.dropped.map((r) => r.quantity)).toEqual(["Sample wt"])
  })

  it("keeps every settled reading when no rule picks one", () => {
    expect(normalize({ dropUnstable: true }, [weight(1), weight(2)]).kept).toEqual([weight(1), weight(2)])
  })
})

function peak(name: string, minutes: number, area: number, role = "impurity"): Reading {
  return { quantity: name, value: 0, unit: "%", places: 2, takenAt: "2026-10-26T14:05:00.000Z", sampleId: "S-1", status: "stable", extras: { minutes, area, role } }
}

describe("normalize: chromatography rules", () => {
  const peaks = [peak("Solvent front", 1.82, 1000), peak("Drug", 4.37, 9000, "main peak"), peak("Impurity A", 5.9, 1000)]

  it("drops peaks that elute before the limit", () => {
    const { dropped, stable } = normalize({ dropBeforeMinutes: 2 }, peaks)
    expect(dropped.map((r) => r.quantity)).toEqual(["Solvent front"])
    expect(stable.map((r) => r.quantity)).toEqual(["Drug", "Impurity A"])
  })

  it("works out purity as the main peak's share of the kept area", () => {
    const { kept } = normalize({ dropBeforeMinutes: 2, purity: { quantity: "Purity" } }, peaks)
    expect(kept).toHaveLength(1)
    expect(kept[0]).toMatchObject({ quantity: "Purity", value: 90, unit: "%", places: 2 })
  })

  it("gives no purity when there is no main peak", () => {
    expect(normalize({ purity: { quantity: "Purity" } }, [peak("A", 3, 10)]).kept).toEqual([])
  })

  it("rounds purity to two places", () => {
    const { kept } = normalize({ purity: { quantity: "Purity" } }, [peak("Drug", 4, 2, "main peak"), peak("B", 5, 1)])
    expect(kept[0]?.value).toBe(66.67)
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

describe("runBridge: HPLC", () => {
  it("turns the peak report into one purity record for the LIMS only", () => {
    const run = runBridge(hplc)
    expect(run.normalized.dropped.map((r) => r.quantity)).toEqual(["Solvent front"])
    expect(run.normalized.kept.map((r) => r.value)).toEqual([98.5])
    expect(run.mapped.map((r) => r.target)).toEqual(["lims"])
  })

  it("names the sample, instrument, analyte and unit in the LIMS record", () => {
    const [lims] = runBridge(hplc).mapped
    expect(lims?.fields).toMatchObject({ sample_ref: "S-2026-0415", instrument_id: "EQ-0518", analyte: "Purity (area %)", result_value: 98.5, unit: "%" })
  })
})

describe("runBridge", () => {
  it("turns the balance capture into one LIMS record and one ledger record", () => {
    const run = runBridge(balance)
    expect(run.normalized.kept.map((r) => r.value)).toEqual([0.1204])
    expect(run.mapped.map((r) => r.target)).toEqual(["lims", "ledger"])
  })
})

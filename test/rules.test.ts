import { describe, expect, it } from "vitest"
import { normalize } from "../src/bridge/normalize"
import { mapRecords } from "../src/bridge/map"
import { deliver } from "../src/bridge/deliver"
import { runBridge } from "../src/bridge/pipeline"
import { deviceById, devices, targets } from "../src/registry"
import type { Device } from "../src/registry/schema"
import type { Reading } from "../src/bridge/types"

const reading: Reading = {
  quantity: "Temperature",
  value: 7.2,
  unit: "mA",
  takenAt: "2026-10-26T03:00:00.000Z",
  sampleId: "RACK-3",
  status: "stable",
  alarm: false,
  extras: {},
}

const fixedDeps = { now: () => "2026-10-26T15:00:00.000Z", nextRef: (prefix: string) => `${prefix}-0001` }

describe("normalize", () => {
  it("drops unstable readings when the rule says so", () => {
    const result = normalize({ dropUnstable: true }, [reading, { ...reading, status: "unstable" }])
    expect(result.kept).toHaveLength(1)
    expect(result.dropped).toHaveLength(1)
  })

  it("scales a loop current and flags an alarm", () => {
    const scale = { fromMin: 4, fromMax: 20, toMin: -100, toMax: 0, unit: "°C" }
    const { kept } = normalize({ scale, alarmAbove: -70 }, [reading, { ...reading, value: 9.104 }])
    expect(kept.map((r) => [r.value, r.unit, r.alarm])).toEqual([
      [-80, "°C", false],
      [-68.1, "°C", true],
    ])
  })
})

describe("mapRecords", () => {
  it("fills fields from reading paths, device paths and constants", () => {
    const device = deviceById("freezer") as Device
    const [record] = mapRecords(device, [reading])
    expect(record).toEqual({
      target: "inventory",
      readingIndex: 0,
      fields: { container_ref: "RACK-3", quantity: 7.2, unit: "mA", observed_at: reading.takenAt, alarm: false },
    })
  })

  it("leaves out fields whose path has no value", () => {
    const device = deviceById("plate-reader") as Device
    const [record] = mapRecords(device, [{ ...reading, extras: {} }])
    expect(Object.keys(record?.fields ?? {})).not.toContain("well")
    expect(mapRecords(device, [{ ...reading, extras: { well: "B7" } }])[0]?.fields["well"]).toBe("B7")
  })
})

describe("deliver", () => {
  it("accepts a record with every required field", () => {
    const fields = { container_ref: "A", quantity: 1, unit: "g", observed_at: "t" }
    const [receipt] = deliver(targets, [{ target: "inventory", readingIndex: 0, fields }], fixedDeps)
    expect(receipt).toEqual({ target: "inventory", readingIndex: 0, accepted: true, ref: "INV-0001", at: "2026-10-26T15:00:00.000Z", missing: [] })
  })

  it("rejects a record and names the missing fields", () => {
    const [receipt] = deliver(targets, [{ target: "inventory", readingIndex: 0, fields: { unit: "g" } }], fixedDeps)
    expect(receipt?.accepted).toBe(false)
    expect(receipt?.missing).toEqual(["container_ref", "quantity", "observed_at"])
  })
})

describe("runBridge", () => {
  it.each(devices.map((d) => [d.id, d] as const))("delivers every %s record without rejection", (_id, device) => {
    const run = runBridge(device, targets, fixedDeps)
    expect(run.receipts.length).toBeGreaterThan(0)
    expect(run.receipts.filter((r) => !r.accepted)).toEqual([])
  })
})

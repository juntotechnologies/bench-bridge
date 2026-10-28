/** Drift checks: each view that names GPIB names it first as IEEE-488 (GPIB), so a reader sees the standard. */
import { describe, expect, it } from "vitest"
import { catalog, devices, kitById, kitChecks, kitSafeguards, kitTitle, partsOf } from "@shared/registry"
import type { CatalogEntry, Device, Kit, KitPart, KitStep } from "@shared/registry/schema"

const LABEL = "IEEE-488 (GPIB)"
const SHORT = "GPIB"

/** True when a text has no GPIB, or when its first GPIB sits inside the full label. */
function labelledFirst(text: string): boolean {
  const first = text.indexOf(SHORT)
  return first === -1 || first === text.indexOf(LABEL) + LABEL.indexOf(SHORT)
}

function stepText(step: KitStep): string {
  return `${step.title} ${step.detail}`
}

function partText(part: KitPart): string {
  return [part.name, part.job, part.why, ...part.examples.map((e) => `${e.vendor} ${e.product} ${e.note}`)].join(" ")
}

function cardView(entry: CatalogEntry): string {
  return `${entry.name} ${entry.interface} ${entry.why}`
}

function overviewView(device: Device): string {
  return [device.name, device.summary, ...device.today, ...device.bridged, kitTitle(device), ...device.specs.flat()].join(" ")
}

function portView(device: Device): string {
  return [device.port.kind, device.port.connector, ...device.connection.flat(), device.port.settings, ...device.port.pins.flat()].join(" ")
}

function kitView(kit: Kit): string {
  const steps = [...kit.flow, ...kit.install, ...kitChecks, ...kitSafeguards].map(stepText)
  return [kit.name, kit.summary, ...partsOf(kit).map(partText), ...steps].join(" ")
}

describe("labelledFirst", () => {
  it("passes a text whose first GPIB is in the label, or a text with no GPIB", () => {
    expect(labelledFirst("An IEEE-488 (GPIB) port. The GPIB bus.")).toBe(true)
    expect(labelledFirst("RS-232 print")).toBe(true)
  })

  it("fails a bare first GPIB", () => {
    expect(labelledFirst("GPIB, legacy CDS")).toBe(false)
    expect(labelledFirst("The GPIB bus, IEEE-488 (GPIB)")).toBe(false)
  })
})

describe("IEEE-488 (GPIB) is named in full on first mention", () => {
  it.each(catalog.map((entry) => [entry.id, entry] as const))("%s catalogue card", (_id, entry) => {
    expect(labelledFirst(cardView(entry))).toBe(true)
  })

  it.each(devices.map((device) => [device.id, device] as const))("%s overview, port and data tabs", (_id, device) => {
    expect(labelledFirst(overviewView(device))).toBe(true)
    expect(labelledFirst(portView(device))).toBe(true)
    expect(labelledFirst(device.port.kind)).toBe(true)
  })

  it.each(devices.map((device) => [device.id, device.kit] as const))("%s kit tab", (_id, kit) => {
    expect(labelledFirst(kitView(kitById(kit)!))).toBe(true)
  })

  it("names the GC-MS port IEEE-488 (GPIB)", () => {
    expect(devices.find((device) => device.id === "gc-ms")?.port.kind).toBe(LABEL)
  })
})

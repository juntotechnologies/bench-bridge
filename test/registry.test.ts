import { describe, expect, it } from "vitest"
import { catalog, containerByRef, devices } from "../src/registry"

describe("registry drift checks", () => {
  it.each(devices.map((d) => [d.id, d] as const))("%s is listed in the catalogue", (id) => {
    expect(catalog.map((entry) => entry.id)).toContain(id)
  })

  it.each(devices.map((d) => [d.id, d] as const))("%s captures against a container in the ledger", (_id, device) => {
    expect(containerByRef(device.capture.containerRef)).toBeDefined()
  })

  it("has unique catalogue IDs", () => {
    expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length)
  })
})

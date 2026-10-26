/** Drift checks for the registry: every live device is in the catalogue, and catalogue IDs are unique. */
import { describe, expect, it } from "vitest"
import { catalog, devices } from "@shared/registry"

describe("registry drift checks", () => {
  it.each(devices.map((d) => [d.id] as const))("%s is listed in the catalogue", (id) => {
    expect(catalog.map((entry) => entry.id)).toContain(id)
  })

  it("has unique catalogue IDs", () => {
    expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length)
  })
})

/** Drift checks for the registry: every live device is in the catalogue, catalogue IDs are unique, and each connection label matches its source. */
import { describe, expect, it } from "vitest"
import { catalog, connectionLabel, connectionOf, copy, devices, portKind } from "@shared/registry"
import { Connection } from "@shared/registry/schema"

const NAMED = Connection.options.filter((id) => id !== "other")

describe("registry drift checks", () => {
  it.each(devices.map((d) => [d.id] as const))("%s is listed in the catalogue", (id) => {
    expect(catalog.map((entry) => entry.id)).toContain(id)
  })

  it("has unique catalogue IDs", () => {
    expect(new Set(catalog.map((entry) => entry.id)).size).toBe(catalog.length)
  })
})

describe("connections", () => {
  it("labels each connection from copy", () => {
    expect(Connection.options.map(connectionLabel)).toEqual(copy.connections.map((entry) => entry.label))
    expect(connectionLabel("gpib")).toBe("IEEE-488 (GPIB)")
  })

  it.each(catalog.filter((entry) => entry.connection !== "other").map((entry) => [entry.id, entry] as const))(
    "%s names its connection in its interface text",
    (_id, entry) => {
      expect(entry.interface).toContain(connectionLabel(entry.connection))
    },
  )

  it.each(catalog.filter((entry) => entry.connection === "other").map((entry) => [entry.id, entry] as const))(
    "%s in Other names no listed connection",
    (_id, entry) => {
      expect(NAMED.map(connectionLabel).filter((label) => entry.interface.includes(label))).toEqual([])
    },
  )

  it.each(devices.map((device) => [device.id, device] as const))("%s takes its connection and port kind from the catalogue", (_id, device) => {
    const entry = catalog.find((item) => item.id === device.id)!
    expect(connectionOf(device)).toBe(entry.connection)
    expect(portKind(device)).toBe(connectionLabel(entry.connection))
  })
})

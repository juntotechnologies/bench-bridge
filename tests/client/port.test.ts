/** Tests that every device has a port diagram that fills exactly its used pins. */
import { describe, expect, it } from "vitest"
import { devices } from "@shared/registry"
import { portDiagram } from "@client/ui/inspector/port"

describe("portDiagram", () => {
  it.each(devices.map((device) => [device.id] as const))("%s has a diagram that fills its used pins", (id) => {
    const device = devices.find((item) => item.id === id)!
    const used = new Set(device.port.pins.map((pin) => pin[0]))
    const markup = portDiagram(device.port.kind, used) ?? ""
    expect(markup.match(/is-used/g)?.length).toBe(used.size)
  })
})

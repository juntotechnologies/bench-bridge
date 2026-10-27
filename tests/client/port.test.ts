/** Tests that every device has a port diagram that fills exactly its used pins. */
import { describe, expect, it } from "vitest"
import { devices } from "@shared/registry"
import { pinNumbers, portDiagram, settingParts } from "@client/ui/inspector/port"

describe("portDiagram", () => {
  it.each(devices.map((device) => [device.id] as const))("%s has a diagram that fills its used pins", (id) => {
    const device = devices.find((item) => item.id === id)!
    const used = new Set(device.port.pins.flatMap((pin) => pinNumbers(pin[0])))
    const markup = portDiagram(device.port.kind, used) ?? ""
    expect(markup.match(/is-used/g)?.length).toBe(used.size)
  })
})

describe("settingParts", () => {
  it("splits a settings line at each dot", () => {
    expect(settingParts("2400 baud · 7E1 · no flow control")).toEqual(["2400 baud", "7E1", "no flow control"])
    expect(settingParts("100 Mbit · raw print, TCP port 9100")).toEqual(["100 Mbit", "raw print, TCP port 9100"])
  })

  it("keeps a line with no dot as one part", () => {
    expect(settingParts("115200 baud")).toEqual(["115200 baud"])
  })
})

describe("pinNumbers", () => {
  it("reads one pin, a range and a list of both", () => {
    expect(pinNumbers("5")).toEqual(["5"])
    expect(pinNumbers("1–4")).toEqual(["1", "2", "3", "4"])
    expect(pinNumbers("1–2, 13, 18-19")).toEqual(["1", "2", "13", "18", "19"])
  })

  it("counts the used pins of the GPIB port as one contact each", () => {
    const device = devices.find((item) => item.id === "gc-ms")!
    const used = new Set(device.port.pins.flatMap((pin) => pinNumbers(pin[0])))
    expect(used.size).toBe(8 + 1 + 1 + 1 + 1 + 7)
  })
})

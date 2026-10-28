/** Tests for the view logic: which drawing the stage shows, and how a part pick changes. */
import { describe, expect, it } from "vitest"
import { kitIdOf } from "@client/drawings/ids"
import { drawingId, itemPatch, pickedPart, switchedTab } from "@client/ui/view"

describe("drawingId", () => {
  it("is the instrument on every tab except Kit", () => {
    for (const tab of ["overview", "port", "data", "deliver"] as const) expect(drawingId("balance", tab)).toBe("balance")
  })

  it("is the kit of the instrument on the Kit tab", () => {
    expect(drawingId("balance", "kit")).toBe("kit:serial-tap")
    expect(drawingId("hplc", "kit")).toBe("kit:network-tap")
    expect(drawingId("lc-ms", "kit")).toBe("kit:lan-file")
  })
})

describe("kitIdOf", () => {
  it("reads the kit from a kit drawing and nothing from an instrument drawing", () => {
    expect(kitIdOf("kit:serial-tap")).toBe("serial-tap")
    expect(kitIdOf("balance")).toBeNull()
  })
})

describe("pickedPart", () => {
  it("picks a part, and a second pick of the same part clears it", () => {
    expect(pickedPart(null, "tap-serial")).toBe("tap-serial")
    expect(pickedPart("tap-serial", "clock")).toBe("clock")
    expect(pickedPart("clock", "clock")).toBeNull()
  })
})

describe("itemPatch", () => {
  it("picks a part on the kit view", () => {
    expect(itemPatch({ tab: "kit", part: null }, "clock")).toEqual({ part: "clock" })
    expect(itemPatch({ tab: "kit", part: "clock" }, "clock")).toEqual({ part: null })
  })

  it("opens the kit from the bridge tap and ignores any other item on the instrument view", () => {
    expect(itemPatch({ tab: "overview", part: null }, "bridge")).toEqual({ tab: "kit", part: null })
    expect(itemPatch({ tab: "port", part: null }, "port")).toBeNull()
  })
})

describe("switchedTab", () => {
  it("goes from the instrument to the kit and from the kit to the overview", () => {
    expect(switchedTab("data")).toBe("kit")
    expect(switchedTab("kit")).toBe("overview")
  })
})

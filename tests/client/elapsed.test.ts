/** Tests for the run readout: elapsed seconds with one decimal. */
import { describe, expect, it } from "vitest"
import { elapsedText } from "@client/ui/elapsed"

describe("elapsedText", () => {
  it("shows seconds with one decimal", () => {
    expect([0, 1_000, 2_740, 12_050].map((ms) => elapsedText(5_000, 5_000 + ms))).toEqual(["0.0 s", "1.0 s", "2.7 s", "12.1 s"])
  })

  it("never shows a negative time when the clock steps back", () => {
    expect(elapsedText(5_000, 4_000)).toBe("0.0 s")
  })
})

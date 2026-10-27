/** Tests for the header clock text format and the link back to the hub. */
import { describe, expect, it } from "vitest"
import { clockText, hubAttrs } from "@client/ui/header"
import { copy } from "@shared/registry"

describe("clockText", () => {
  it("formats the day in capitals and the time as 24-hour HH:MM:SS", () => {
    const [day, time] = clockText(new Date("2026-10-26T15:04:11Z"))
    expect(day).toMatch(/^[A-Z]{3} \d\d, \d{4}$/)
    expect(time).toMatch(/^\d\d:\d\d:\d\d$/)
  })
})

describe("hubAttrs", () => {
  it("points at the hub card and opens in the same tab", () => {
    const attrs = hubAttrs(copy.hub)
    expect(attrs["href"]).toBe("https://juntotechnologies.com/#bench-bridge")
    expect(attrs).not.toHaveProperty("target")
  })

  it("names the link for a screen reader", () => {
    expect(hubAttrs(copy.hub)["aria-label"]).toBe("Back to Junto Technologies")
  })
})

/** Tests for the header clock text format. */
import { describe, expect, it } from "vitest"
import { clockText } from "@client/ui/header"

describe("clockText", () => {
  it("formats the day in capitals and the time as 24-hour HH:MM:SS", () => {
    const [day, time] = clockText(new Date("2026-10-26T15:04:11Z"))
    expect(day).toMatch(/^[A-Z]{3} \d\d, \d{4}$/)
    expect(time).toMatch(/^\d\d:\d\d:\d\d$/)
  })
})

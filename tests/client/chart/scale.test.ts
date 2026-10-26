/** Tests for the chart scales: a linear map and clean axis ticks. */
import { describe, expect, it } from "vitest"
import { linear, ticks } from "@client/ui/chart/scale"

describe("linear", () => {
  it("maps the domain onto the range, and can flip it", () => {
    expect(linear([0, 10], [0, 100])(2.5)).toBe(25)
    expect(linear([0, 1], [100, 0])(0.25)).toBe(75)
  })

  it("maps a flat domain to the middle of the range", () => {
    expect(linear([5, 5], [0, 100])(5)).toBe(50)
  })
})

describe("ticks", () => {
  it("picks whole steps for minutes", () => {
    expect(ticks(0, 8, 4).map((tick) => tick.label)).toEqual(["0", "2", "4", "6", "8"])
  })

  it("picks fine steps with matching decimals for a narrow weight range", () => {
    expect(ticks(25.36, 25.49, 3).map((tick) => tick.label)).toEqual(["25.40", "25.45"])
  })

  it("keeps every tick inside the domain", () => {
    for (const tick of ticks(0.3, 7.9, 4)) expect(tick.at >= 0.3 && tick.at <= 7.9).toBe(true)
  })
})

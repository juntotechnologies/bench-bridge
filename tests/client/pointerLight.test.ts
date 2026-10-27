/** Tests for the pointer light: where the light sits on a card, and when it may show. */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import components from "@design/components.json"
import { CARD_SELECTOR, LIGHT_QUERY, lightPosition } from "@client/ui/pointerLight"

describe("lightPosition", () => {
  it("measures the pointer from the top left corner of the card, in pixels", () => {
    expect(lightPosition({ left: 100, top: 40 }, { x: 130, y: 95 })).toEqual({ x: "30px", y: "55px" })
  })

  it("keeps a pointer left of the card at a negative offset, so the light leaves the card", () => {
    expect(lightPosition({ left: 100, top: 40 }, { x: 90, y: 40 })).toEqual({ x: "-10px", y: "0px" })
  })

  it("rounds a fractional offset to a whole pixel", () => {
    expect(lightPosition({ left: 0.4, top: 0.4 }, { x: 10.2, y: 20.6 })).toEqual({ x: "10px", y: "20px" })
  })
})

describe("LIGHT_QUERY", () => {
  it("asks for a pointer that hovers and for no reduced motion", () => {
    expect(LIGHT_QUERY).toContain("(hover: hover)")
    expect(LIGHT_QUERY).toContain("(pointer: fine)")
    expect(LIGHT_QUERY).toContain("(prefers-reduced-motion: no-preference)")
  })
})

describe("the stylesheet and the design spec", () => {
  const stylesheet = readFileSync("client/styles.css", "utf8")

  it("repeats the media query of the light, so the light stays off where the script is off", () => {
    expect(stylesheet).toContain(`@media ${LIGHT_QUERY}`)
  })

  it("styles the attribute that the script looks for, and the spec names it", () => {
    expect(stylesheet).toContain(CARD_SELECTOR)
    expect(components.map(selectorOf)).toContain(CARD_SELECTOR)
  })
})

interface Recipe {
  selector: string
}

function selectorOf(component: Recipe): string {
  return component.selector
}

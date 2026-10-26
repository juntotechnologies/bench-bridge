/** Tests that the CSS breakpoints match layout.json and that the pane list matches the copy. */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import layout from "@client/layout.json"
import { PANES } from "@client/ui/store"
import { copy } from "@shared/registry"

const QUERY = /@(?:media|container)[^{]*/g
const CONDITION = /\((min|max)-(width|height):\s*(\d+)px\)/g

/** Every size condition in the stylesheet's @media and @container rules, as "max-width: 1099". */
function cssConditions(css: string): string[] {
  return (css.match(QUERY) ?? []).flatMap(conditionsOf)
}

function conditionsOf(rule: string): string[] {
  return [...rule.matchAll(CONDITION)].map(describeMatch)
}

function describeMatch(match: RegExpMatchArray): string {
  return `${match[1]}-${match[2]}: ${match[3]}`
}

function expectedConditions(): string[] {
  return [
    `min-width: ${layout.compactBelow}`,
    `max-width: ${layout.compactBelow - 1}`,
    `max-width: ${layout.wideFrom - 1}`,
    `max-width: ${layout.iconsFrom - 1}`,
    `min-width: ${layout.stampFrom}`,
    `max-height: ${layout.shortHeight}`,
  ]
}

interface PaneRef {
  id: string
}

function paneId(pane: PaneRef): string {
  return pane.id
}

describe("stylesheet breakpoints", () => {
  it("uses only sizes derived from layout.json", () => {
    const found = new Set(cssConditions(readFileSync("client/styles.css", "utf8")))
    expect([...found].sort()).toEqual(expectedConditions().sort())
  })

  it("keeps the narrow tier below the wide tier", () => {
    expect(layout.compactBelow).toBeLessThan(layout.iconsFrom)
    expect(layout.iconsFrom).toBeLessThan(layout.wideFrom)
  })
})

describe("pane switch", () => {
  it("lists in copy the same panes the store knows, in the same order", () => {
    expect(copy.panes.map(paneId)).toEqual([...PANES])
  })
})

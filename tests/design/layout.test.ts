/** Tests that the CSS breakpoints match design/layout.json and that the pane list matches the copy. */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import layout from "@design/layout.json"
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
    `min-width: ${layout.compactBelow.value}`,
    `max-width: ${layout.compactBelow.value - 1}`,
    `max-width: ${layout.wideFrom.value - 1}`,
    `max-width: ${layout.iconsFrom.value - 1}`,
    `min-width: ${layout.stampFrom.value}`,
    `max-height: ${layout.shortHeight.value}`,
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
    expect(layout.compactBelow.value).toBeLessThan(layout.iconsFrom.value)
    expect(layout.iconsFrom.value).toBeLessThan(layout.wideFrom.value)
  })
})

describe("pane switch", () => {
  it("lists in copy the same panes the store knows, in the same order", () => {
    expect(copy.panes.map(paneId)).toEqual([...PANES])
  })
})

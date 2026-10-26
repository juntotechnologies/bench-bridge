/** Tests for the dark theme of the design spec: generated CSS, complete dark values and readable colour pairs. */
import { describe, expect, it } from "vitest"
import { specProblems } from "@design/check"
import { contrastProblems, contrastRatio } from "@design/contrast"
import { tokenCss } from "@design/css"
import { readSpec } from "@design/files"
import type { Spec, Tokens } from "@design/schema"

const spec = readSpec("design")

const SMALL: Tokens = {
  color: { paper: { value: "#ffffff", dark: "#000000", use: "Page" }, accent: { value: "#ff0000", use: "Accent" } },
  radius: { "radius-sm": { value: "8px", use: "Small" } },
}

describe("tokenCss", () => {
  const css = tokenCss(SMALL)

  it("declares the light values on the root", () => {
    expect(css).toContain(":root {")
    expect(css).toContain("--paper: #ffffff;")
  })

  it("overrides only the tokens that have a dark value, for an explicit dark choice", () => {
    expect(css).toContain(':root[data-theme="dark"] {')
    const block = css.split(':root[data-theme="dark"] {')[1]?.split("}")[0] ?? ""
    expect(block).toContain("--paper: #000000;")
    expect(block).not.toContain("--accent")
    expect(block).toContain("color-scheme: dark;")
  })

  it("follows the system when the user made no choice, and never overrides an explicit light choice", () => {
    expect(css).toContain("@media (prefers-color-scheme: dark)")
    expect(css).toContain(':root:not([data-theme="light"]) {')
  })
})

describe("specProblems for the dark theme", () => {
  it("names every colour and shadow token that has no dark value", () => {
    const bare: Spec = { ...spec, tokens: { ...spec.tokens, color: { ...spec.tokens["color"], oops: { value: "#123456", use: "Test" } } } }
    expect(specProblems(bare)).toContain("token has no dark value: oops")
  })

  it("finds none in the real spec", () => {
    expect(specProblems(spec)).toEqual([])
  })
})

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5)
    expect(contrastRatio("#e8590c", "#e8590c")).toBeCloseTo(1, 5)
  })

  it("does not depend on the order of the two colours", () => {
    expect(contrastRatio("#1c1b19", "#fbf9f4")).toBeCloseTo(contrastRatio("#fbf9f4", "#1c1b19"), 8)
  })
})

describe("contrastProblems", () => {
  it("finds every pair in both themes readable", () => {
    expect(contrastProblems(spec)).toEqual([])
  })

  it("reports a pair that is too faint, with its theme", () => {
    const faint: Spec = { ...spec, contrast: [{ fg: "ink-3", bg: "paper", min: 21, use: "Test" }] }
    expect(contrastProblems(faint).map((problem) => problem.split(":")[0])).toEqual(["light ink-3 on paper", "dark ink-3 on paper"])
  })
})

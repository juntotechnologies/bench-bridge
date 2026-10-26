/** Tests for the design spec: generated files in sync, sources valid, and the app stylesheet using tokens only. */
import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { specProblems } from "@design/check"
import { Tokens, type Components } from "@design/schema"
import { tokenCss, tokenNames } from "@design/css"
import { readSpec, sourceTexts, staleOutputs, type Outputs } from "@design/files"
import { lockText } from "@design/lock"
import { specMarkdown } from "@design/spec"

const DIR = "design"
const STYLESHEET = readFileSync("client/styles.css", "utf8")
const spec = readSpec(DIR)

const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/
const RAW_TIMING = /\b\d*\.?\d+m?s\b/
const RAW_RADIUS = /border-radius: (?!var\(--radius-|50%|0\b)/
const RAW_SHADOW = /box-shadow: (?!var\(--|none)/
const VAR_USE = /var\(--([a-z0-9-]+)/g
const LOCAL_VARS = ["zoom", "i"]

function outputs(): Outputs {
  return { "tokens.css": tokenCss(spec.tokens), "SPEC.md": specMarkdown(spec), "spec.lock": lockText(sourceTexts(DIR)) }
}

function declarations(css: string): string[] {
  return css.split("\n").filter(isDeclaration)
}

function isDeclaration(line: string): boolean {
  return line.includes(":") && !line.trim().startsWith("/*") && !line.includes("@")
}

function usedVars(css: string): string[] {
  return [...css.matchAll(VAR_USE)].map(firstGroup)
}

function firstGroup(match: RegExpMatchArray): string {
  return match[1] ?? ""
}

function isUnknown(known: string[], name: string): boolean {
  return !known.includes(name) && !LOCAL_VARS.includes(name)
}

describe("design spec files", () => {
  it("has generated outputs that match the sources", () => {
    expect(staleOutputs(DIR, outputs())).toEqual([])
  })

  it("has no duplicate token and no component naming a missing token", () => {
    expect(specProblems(spec)).toEqual([])
  })

  it("hashes the sources in spec.lock, so a copy can find a local edit", () => {
    expect(readFileSync("design/spec.lock", "utf8")).toBe(lockText(sourceTexts(DIR)))
  })

  it("rejects a token name that is not kebab case", () => {
    expect(() => Tokens.parse({ color: { "Bad Name": { value: "x", use: "y" } } })).toThrow()
  })
})

describe("app stylesheet", () => {
  const lines = declarations(STYLESHEET)

  it("writes no raw colour", () => {
    expect(lines.filter(RAW_COLOUR.test.bind(RAW_COLOUR))).toEqual([])
  })

  it("writes no raw timing outside a token", () => {
    expect(lines.filter(RAW_TIMING.test.bind(RAW_TIMING))).toEqual([])
  })

  it("writes no raw radius or shadow", () => {
    expect(lines.filter(RAW_RADIUS.test.bind(RAW_RADIUS))).toEqual([])
    expect(lines.filter(RAW_SHADOW.test.bind(RAW_SHADOW))).toEqual([])
  })

  it("uses only tokens that exist", () => {
    const known = tokenNames(spec.tokens)
    expect(usedVars(STYLESHEET).filter(isUnknown.bind(null, known))).toEqual([])
  })

  it("styles every selector the components name", () => {
    const missing = spec.components.map(selectorOf).filter(isUnstyled)
    expect(missing).toEqual([])
  })

  it("has a stylesheet to read", () => {
    expect(existsSync("client/styles.css")).toBe(true)
  })
})

function selectorOf(component: Components[number]): string {
  return component.selector
}

function isUnstyled(selector: string): boolean {
  return !STYLESHEET.includes(selector)
}

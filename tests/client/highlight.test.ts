/** Tests for the JSON tokenizer behind the code block colours. */
import { describe, expect, it } from "vitest"
import { tokenizeJson, type Token } from "@client/ui/highlight"

function kinds(tokens: Token[]): string[] {
  return tokens.filter((token) => token.kind !== "space").map((token) => token.kind)
}

function joined(tokens: Token[]): string {
  return tokens.map((token) => token.text).join("")
}

describe("tokenizeJson", () => {
  it("tells a key from a string value", () => {
    expect(kinds(tokenizeJson('  "analyte": "Purity (area %)",'))).toEqual(["key", "punct", "string", "punct"])
  })

  it("marks numbers and literals", () => {
    expect(kinds(tokenizeJson('  "result_value": 98.5,'))).toEqual(["key", "punct", "number", "punct"])
    expect(kinds(tokenizeJson('  "stable": true'))).toEqual(["key", "punct", "literal"])
    expect(kinds(tokenizeJson('  "offset": -1.5e-3'))).toEqual(["key", "punct", "number"])
  })

  it("marks braces", () => {
    expect(kinds(tokenizeJson("{"))).toEqual(["punct"])
  })

  it("keeps a colon inside a string as part of the string", () => {
    expect(kinds(tokenizeJson('  "at": "2026-10-26T14:05:02.400Z"'))).toEqual(["key", "punct", "string"])
  })

  it("loses no character", () => {
    const line = '  "unit": "%", "x": [1, null] ~'
    expect(joined(tokenizeJson(line))).toBe(line)
  })
})

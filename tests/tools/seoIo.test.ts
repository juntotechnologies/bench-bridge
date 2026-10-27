/** Tests for the drift check: a generated file is stale when it is missing or differs from its source. */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { TextFile } from "../../tools/seo/files"
import { staleTexts, writeText } from "../../tools/seo/io"

const FILE: TextFile = { path: "public/.well-known/robots.txt", content: "User-agent: *\n" }
let root = ""

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "seo-io-"))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe("staleTexts", () => {
  it("reports a file that does not exist", () => {
    expect(staleTexts(root, [FILE])).toEqual([FILE])
  })

  it("reports nothing after the file is written, folders included", () => {
    writeText(root, FILE)
    expect(staleTexts(root, [FILE])).toEqual([])
  })

  it("reports a file that someone edited by hand", () => {
    writeText(root, FILE)
    writeFileSync(join(root, FILE.path), "edited\n")
    expect(staleTexts(root, [FILE])).toEqual([FILE])
  })
})

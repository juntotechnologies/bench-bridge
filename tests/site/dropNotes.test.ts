/** Tests for the plugin that keeps AGENTS.md out of the built site. */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { dropNotes, removeNote } from "../../site/dropNotes"

let outDir = ""

beforeEach(() => {
  outDir = mkdtempSync(join(tmpdir(), "drop-notes-"))
})

afterEach(() => {
  rmSync(outDir, { recursive: true, force: true })
})

describe("dropNotes", () => {
  it("removes AGENTS.md and keeps the other files", () => {
    writeFileSync(join(outDir, "AGENTS.md"), "note")
    writeFileSync(join(outDir, "robots.txt"), "rules")
    removeNote(outDir)
    expect(existsSync(join(outDir, "AGENTS.md"))).toBe(false)
    expect(existsSync(join(outDir, "robots.txt"))).toBe(true)
  })

  it("does nothing when there is no note", () => {
    expect(() => removeNote(outDir)).not.toThrow()
  })

  it("runs when the bundle closes", () => {
    expect(dropNotes(outDir)).toMatchObject({ name: "drop-notes", closeBundle: expect.any(Function) })
  })
})

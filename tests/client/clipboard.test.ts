/** Tests for copying text: the modern clipboard first, the selection fallback when it is missing or refused. */
import { describe, expect, it } from "vitest"
import { copyText, type ClipboardEnv } from "@client/ui/clipboard"

interface Spy {
  env: ClipboardEnv
  written: string[]
  legacy: string[]
}

function spy(writeText: ClipboardEnv["writeText"], legacyResult: boolean): Spy {
  const written: string[] = []
  const legacy: string[] = []
  const wrapped = writeText ? async (text: string): Promise<void> => (written.push(text), writeText(text)) : null
  return { env: { writeText: wrapped, legacyCopy: (text: string) => (legacy.push(text), legacyResult) }, written, legacy }
}

describe("copyText", () => {
  it("uses the modern clipboard when the page may", async () => {
    const run = spy(async () => undefined, true)
    expect(await copyText(run.env, "a")).toBe(true)
    expect([run.written, run.legacy]).toEqual([["a"], []])
  })

  it("falls back to the selection copy on plain HTTP, where there is no modern clipboard", async () => {
    const run = spy(null, true)
    expect(await copyText(run.env, "b")).toBe(true)
    expect(run.legacy).toEqual(["b"])
  })

  it("falls back when the modern clipboard refuses", async () => {
    const run = spy(async () => Promise.reject(new Error("denied")), true)
    expect(await copyText(run.env, "c")).toBe(true)
    expect(run.legacy).toEqual(["c"])
  })

  it("reports a failure when both ways fail", async () => {
    const run = spy(null, false)
    expect(await copyText(run.env, "d")).toBe(false)
  })
})

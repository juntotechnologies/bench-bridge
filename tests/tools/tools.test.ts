/** Tests for the repo tooling: the AGENTS.md helpers and the file docstring lint rule. */
import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import { missingAgentsMd } from "../../tools/agents-md"
import { isCheckedName } from "../../tools/repo-files"
import fileDocstring from "../../tools/eslint/file-docstring.js"

function lint(code: string): string[] {
  const linter = new Linter()
  const config = [{ plugins: { local: { rules: { "file-docstring": fileDocstring } } }, rules: { "local/file-docstring": "error" as const } }]
  return linter.verify(code, config).map((message) => message.messageId ?? "")
}

describe("agents-md helpers", () => {
  it("skips hidden and ignored directory names", () => {
    expect([".git", "node_modules", "archive", "shared"].map(isCheckedName)).toEqual([false, false, false, true])
  })

  it("lists the directories the check says have no file", () => {
    expect(missingAgentsMd(["a", "b", "c"], (dir) => dir === "b")).toEqual(["a", "c"])
  })
})

describe("file-docstring rule", () => {
  it("accepts a one-line docstring on line 1", () => {
    expect(lint("/** Parses balance lines into readings. */\nconst a = 1\n")).toEqual([])
  })

  it("rejects a file with no docstring", () => {
    expect(lint("const a = 1\n")).toEqual(["missing"])
  })

  it("rejects a docstring that is not on line 1", () => {
    expect(lint("const a = 1\n/** Parses balance lines into readings. */\n")).toEqual(["missing"])
  })

  it("rejects a docstring that spans lines", () => {
    expect(lint("/**\n * Parses balance lines.\n */\nconst a = 1\n")).toEqual(["missing"])
  })
})

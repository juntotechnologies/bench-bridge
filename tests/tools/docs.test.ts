/** Tests for the docs generator: block filling, facts from the real pipeline, references and notes. */
import { describe, expect, it } from "vitest"
import { buildFacts } from "../../tools/docs/facts"
import { applyBlocks, type Renderers } from "../../tools/docs/markers"
import { staleNotes, type Notes } from "../../tools/docs/notes"
import { npmScriptRefs, pathRefs, unknownNames } from "../../tools/docs/references"
import { createRenderers, markdownTable, type RenderInputs } from "../../tools/docs/renderers"

const notes: Notes = { files: { "dir/a.json": "Holds a" }, scripts: { dev: "Starts it" }, generators: { fact: { arg: "A key", fills: "A value" } } }

function inputs(overrides: Partial<RenderInputs> = {}): RenderInputs {
  return { facts: { "x.y": "42" }, notes, scripts: ["dev"], topDirs: ["dir"], entriesOf: () => ["a.json"], purposeOf: () => "Purpose.", ...overrides }
}

describe("applyBlocks", () => {
  const renderers: Renderers = { fact: (key: string) => `[${key}]` }

  it("fills a block and keeps its markers", () => {
    const out = applyBlocks("a <!-- gen:fact k --><!-- /gen --> b", renderers)
    expect(out).toBe("a <!-- gen:fact k -->[k]<!-- /gen --> b")
  })

  it("replaces stale content and is idempotent", () => {
    const once = applyBlocks("<!-- gen:fact k -->old<!-- /gen -->", renderers)
    expect(applyBlocks(once, renderers)).toBe(once)
  })

  it("throws on an unknown generator", () => {
    expect(() => applyBlocks("<!-- gen:nope --><!-- /gen -->", renderers)).toThrow("unknown generator: nope")
  })
})

describe("renderers", () => {
  it("renders a fact and throws on an unknown fact", () => {
    const { fact } = createRenderers(inputs())
    expect(fact?.("x.y")).toBe("42")
    expect(() => fact?.("nope")).toThrow("unknown fact: nope")
  })

  it("renders a file table from notes", () => {
    expect(createRenderers(inputs()).files?.("dir")).toContain("| `a.json` | Holds a |")
  })

  it("fails when a listed file has no note", () => {
    const missing = createRenderers(inputs({ entriesOf: () => ["b.json"] }))
    expect(() => missing.files?.("dir")).toThrow("missing note for dir/b.json")
  })

  it("fails when a script has no note", () => {
    expect(() => createRenderers(inputs({ scripts: ["dev", "lint"] })).scripts?.("")).toThrow("missing note for script lint")
  })

  it("builds a markdown table", () => {
    expect(markdownTable(["A", "B"], [["1", "2"]])).toBe("\n| A | B |\n| --- | --- |\n| 1 | 2 |\n")
  })
})

describe("facts", () => {
  const facts = buildFacts()

  it("computes the balance figures by running the real pipeline", () => {
    expect(facts["balance.run.used"]).toBe("0.1204")
    expect(facts["balance.ledger.closing"]).toBe("1.7531")
    expect(facts["balance.receipt.lims"]).toBe("RES-000001")
  })

  it("computes the HPLC figures by running the real pipeline", () => {
    expect(facts["hplc.run.used"]).toBe("98.5")
    expect(facts["hplc.run.unit"]).toBe("%")
    expect(facts["hplc.receipt.lims"]).toBe("RES-000001")
    expect(facts["hplc.receipt.ledger"]).toBeUndefined()
  })

  it("names the live instruments", () => {
    expect(facts["catalog.liveNames"]).toBe("Analytical balance and HPLC system")
  })

  it("counts the catalogue", () => {
    expect(Number(facts["catalog.live"]) + Number(facts["catalog.planned"])).toBe(Number(facts["catalog.count"]))
  })
})

describe("references", () => {
  it("finds npm scripts and file paths a doc names", () => {
    const text = "Run `npm run docs`, then see `shared/data/devices.json` and `a.ts`. Not `@shared/*`."
    expect(npmScriptRefs(text)).toEqual(["docs"])
    expect(pathRefs(text)).toEqual(["shared/data/devices.json", "a.ts"])
  })

  it("lists names that are not allowed, without repeats", () => {
    expect(unknownNames(["a", "b", "b"], ["a"])).toEqual(["b"])
  })
})

describe("staleNotes", () => {
  it("reports notes whose file or script is gone", () => {
    const names = { scripts: [], generators: [] }
    expect(staleNotes(notes, () => false, names)).toEqual([
      "note for missing file: dir/a.json",
      "note for missing script: dev",
      "note for missing generator: fact",
    ])
  })
})

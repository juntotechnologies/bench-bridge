/** Tests for the glossary: spelled-out forms, one-pass spell-out and the bare-initialism check. */
import { describe, expect, it } from "vitest"
import { bareInitialisms, glossary, spelled, spellOut, type Glossary } from "../../tools/docs/glossary"
import { createRenderers, type RenderInputs } from "../../tools/docs/renderers"

const small: Glossary = {
  GC: { expansion: "Gas Chromatography", meaning: "Separates a vapor" },
  "GC-MS": { expansion: "Gas Chromatography-Mass Spectrometry", meaning: "GC with mass" },
  CS: { expansion: "controlled-substance", meaning: "Regulated" },
}

describe("spelled", () => {
  it("puts the initialism in parentheses after the expansion", () => {
    expect(spelled(small, "CS", false)).toBe("controlled-substance (CS)")
  })

  it("capitalizes the first letter on request", () => {
    expect(spelled(small, "CS", true)).toBe("Controlled-substance (CS)")
  })

  it("throws on an unknown initialism", () => {
    expect(() => spelled(small, "XYZ", false)).toThrow("unknown initialism: XYZ")
  })
})

describe("spellOut", () => {
  it("spells out every use, the longest key first", () => {
    expect(spellOut(small, "GC-MS and GC")).toBe("Gas Chromatography-Mass Spectrometry (GC-MS) and Gas Chromatography (GC)")
  })

  it("leaves a word that only contains an initialism", () => {
    expect(spellOut(small, "CSU-000001")).toBe("CSU-000001")
  })
})

describe("bareInitialisms", () => {
  it("finds a bare initialism with its line", () => {
    expect(bareInitialisms(small, "ok\nthe CS ledger")).toEqual([{ key: "CS", line: 2 }])
  })

  it("accepts the spelled form, at the start of a sentence too", () => {
    expect(bareInitialisms(small, "controlled-substance (CS) and Controlled-substance (CS)")).toEqual([])
  })

  it("ignores inline code and generator markers", () => {
    expect(bareInitialisms(small, "`CS` <!-- gen:term CS --><!-- /gen -->")).toEqual([])
  })

  it("finds a spelled form that lacks its parentheses", () => {
    expect(bareInitialisms(small, "controlled-substance CS")).toEqual([{ key: "CS", line: 1 }])
  })
})

function noEntries(): string[] {
  return []
}

function noPurpose(): string {
  return ""
}

describe("glossary renderers", () => {
  const inputs: RenderInputs = { facts: { kit: "Tap with DB9" }, notes: { files: {}, scripts: {}, generators: {} }, scripts: [], topDirs: [], entriesOf: noEntries, purposeOf: noPurpose }
  const renderers = createRenderers(inputs)

  it("spells a term, capitalized on request", () => {
    expect(renderers.term?.("LIMS capitalize")).toBe("Laboratory Information Management System (LIMS)")
    expect(renderers.term?.("IQ capitalize")).toBe("Installation qualification (IQ)")
  })

  it("spells out a fact for speech", () => {
    expect(renderers.spoken?.("kit")).toBe("Tap with nine-pin D-subminiature (DB9)")
  })

  it("lists every initialism in the table", () => {
    const rows = renderers.glossary?.("").split("\n").length ?? 0
    expect(rows).toBe(Object.keys(glossary).length + 4)
  })
})

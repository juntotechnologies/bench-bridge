/** Tests for the honest copy: sentence length, banned claims and required labels, over the source and over every generated file. */
import { describe, expect, it } from "vitest"
import { readPlan } from "../../tools/seo/plan"
import { Seo } from "../../tools/seo/schema"
import seoJson from "../../site/seo.json"

const MAX_WORDS = 20
const plan = readPlan(process.cwd(), "2026-01-01")
const generated = plan.texts.map((file) => file.content).join("\n")
const seo = Seo.parse(seoJson)

const BANNED: Record<string, RegExp> = {
  "an email address": /[\w.+-]+@[\w-]+(\.[\w-]+)+/,
  "a price": /[$€£]\s?\d|\b(prices?|pricing|per month|per year|per seat|USD|EUR)\b/i,
  "a rule or an agency named as a claim": /\b(Part 11|E2500|DEA|FDA|compliant|validated|certified)\b/,
  "a hardware claim": /\b(is|are|was|were) (built|in build|shipping|installed)\b|\bin build\b|\bnow shipping\b/i,
}

function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/)
}

function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter(Boolean).length
}

function copyStrings(): string[] {
  const { agents, links, og } = seo
  const lists = [seo.shows, seo.limits, agents.may, agents.mayNot, links.map((link) => link.note)]
  return [seo.title, seo.tagline, seo.headline, seo.description, seo.summary, seo.needsScript, agents.summary, og.alt, ...lists.flat()]
}

describe("sentence length", () => {
  for (const text of copyStrings()) {
    it(`keeps each sentence to ${MAX_WORDS} words or fewer: ${text.slice(0, 40)}`, () => {
      expect(Math.max(...sentencesOf(text).map(wordCount))).toBeLessThanOrEqual(MAX_WORDS)
    })
  }
})

describe("banned claims", () => {
  for (const [name, pattern] of Object.entries(BANNED)) {
    it(`leaves ${name} out of every generated file`, () => {
      expect(generated).not.toMatch(pattern)
    })
  }
})

describe("required labels", () => {
  it("calls the site a demo with sample data", () => {
    expect(seo.description).toMatch(/^Demo with sample data\./)
    expect(seo.summary).toContain("demo with sample data")
  })

  it("labels the drawings and kits as concept", () => {
    expect(seo.limits.join(" ")).toContain("Drawings and kits are concept.")
  })

  it("says only that the bridge is designed to support validation", () => {
    expect(seo.limits.join(" ")).toContain("designed to support validation")
  })

  it("names a part only as an example, with no endorsement", () => {
    expect(seo.limits.join(" ")).toContain("A part name is not an endorsement.")
  })

  it("gives the booking link as the only contact", () => {
    expect(plan.site.booking).toBe("https://cal.com/shaun-porwal-junto/30min")
  })
})

/** Tests for the typed Site: the maker from the hub link, link resolution, the palette and the schema limits. */
import { describe, expect, it } from "vitest"
import { Seo } from "../../tools/seo/schema"
import { buildSite } from "../../tools/seo/site"
import { fixtureInputs, fixtureSite } from "./seoFixture"

describe("buildSite", () => {
  it("takes the maker from the hub link the app shows", () => {
    expect(fixtureSite().maker).toEqual({ name: "Junto Technologies", url: "https://juntotechnologies.com/" })
  })

  it("names the demo and takes the app id from the hub card", () => {
    const site = fixtureSite()
    expect(site.demoName).toBe("Bench Bridge demo")
    expect(site.appId).toBe("https://juntotechnologies.com/#bench-bridge")
    expect(site.domain).toBe("bench-bridge.example.test")
  })

  it("gives the demo and maker links the urls that other sources own", () => {
    const urls = fixtureSite().links.map((link) => [link.kind, link.url])
    expect(urls).toContainEqual(["demo", "https://bench-bridge.example.test/"])
    expect(urls).toContainEqual(["maker", "https://juntotechnologies.com/"])
  })

  it("reads the booking link", () => {
    expect(fixtureSite().booking).toBe("https://cal.com/shaun-porwal-junto/30min")
  })

  it("takes both palettes from the design tokens", () => {
    const site = fixtureSite()
    expect(site.light.accent).toBe("#e8590c")
    expect(site.dark.paper).toBe("#14161a")
  })

  it("fails when seo.json has no booking link", () => {
    const inputs = fixtureInputs()
    const seo = { ...inputs.seo, links: inputs.seo.links.filter((link) => link.kind !== "booking") }
    expect(() => buildSite({ ...inputs, seo })).toThrow("no booking link")
  })

  it("fails when a link has no url to resolve", () => {
    const inputs = fixtureInputs()
    const seo = { ...inputs.seo, links: [{ kind: "source" as const, label: "Code", note: "Code." }] }
    expect(() => buildSite({ ...inputs, seo })).toThrow("link source has no url")
  })
})

describe("Seo schema", () => {
  it("rejects a title over 60 characters", () => {
    expect(() => Seo.parse({ ...fixtureInputs().seo, title: "x".repeat(61) })).toThrow()
  })

  it("rejects a description over 160 characters", () => {
    expect(() => Seo.parse({ ...fixtureInputs().seo, description: "x".repeat(161) })).toThrow()
  })

  it("rejects an unknown key, so a typo cannot pass", () => {
    expect(() => Seo.parse({ ...fixtureInputs().seo, titel: "x" })).toThrow()
  })
})

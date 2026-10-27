/** Tests for the text renderers: robots.txt, sitemap.xml, llms.txt, agents.txt, agents.json and the manifest. */
import { describe, expect, it } from "vitest"
import { renderAgentsJson, renderAgentsTxt } from "../../tools/seo/agents"
import { renderLlms } from "../../tools/seo/llms"
import { renderManifest } from "../../tools/seo/manifest"
import { renderRobots } from "../../tools/seo/robots"
import { renderSitemap } from "../../tools/seo/sitemap"
import { fixtureSite } from "./seoFixture"

interface IconSize {
  sizes: string
}

const site = fixtureSite()

describe("renderRobots", () => {
  const robots = renderRobots(site)

  it("allows every crawler, and the default agent first", () => {
    const agents = [...robots.matchAll(/^User-agent: (.+)$/gm)].map((match) => match[1])
    expect(agents).toEqual(["*", "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"])
    expect(robots.match(/^Allow: \/$/gm)).toHaveLength(6)
  })

  it("names the sitemap on the site origin", () => {
    expect(robots).toContain("Sitemap: https://bench-bridge.example.test/sitemap.xml")
  })
})

describe("renderSitemap", () => {
  it("lists each page with its date", () => {
    const xml = renderSitemap(site)
    expect(xml).toContain("<loc>https://bench-bridge.example.test/</loc>")
    expect(xml).toContain("<lastmod>2026-01-02</lastmod>")
  })
})

describe("renderLlms", () => {
  const llms = renderLlms(site)

  it("starts with the name and the summary", () => {
    expect(llms.startsWith(`# Bench Bridge\n\n> ${site.seo.summary}`)).toBe(true)
  })

  it("links back to the hub as the maker", () => {
    expect(llms).toContain("[Junto Technologies](https://juntotechnologies.com/): The maker of Bench Bridge.")
  })

  it("lists the instruments from the registry, with initialisms spelled out", () => {
    expect(llms).toContain("High-Performance Liquid Chromatography (HPLC) system")
    expect(llms).toContain("controlled-substance (CS) vault and safe")
  })

  it("lists the pipeline steps and every limit", () => {
    expect(llms).toContain("these steps in order: Capture, Parse.")
    for (const limit of site.seo.limits) expect(llms).toContain(limit)
  })
})

describe("renderAgentsTxt", () => {
  const agents = renderAgentsTxt(site)

  it("allows reading and following links, and bans forms, messages and bookings", () => {
    expect(agents).toContain("Allow: Read each public page.")
    expect(agents).toContain("Allow: Follow each link on a page.")
    for (const ban of ["Post a form.", "Send a message for a person.", "Book a call for a person."]) expect(agents).toContain(`Disallow: ${ban}`)
  })

  it("gives the booking link as the contact", () => {
    expect(agents).toContain("Contact: https://cal.com/shaun-porwal-junto/30min")
  })

  it("points to the sitemap and llms.txt", () => {
    expect(agents).toContain("Sitemap: https://bench-bridge.example.test/sitemap.xml")
    expect(agents).toContain("LLMs: https://bench-bridge.example.test/llms.txt")
  })
})

describe("renderAgentsJson", () => {
  it("holds the same rules as agents.txt", () => {
    const data = JSON.parse(renderAgentsJson(site))
    expect(data.mayDo).toEqual(site.seo.agents.may)
    expect(data.mayNotDo).toEqual(site.seo.agents.mayNot)
    expect(data.contact).toBe(site.booking)
    expect(data.maker).toBe("https://juntotechnologies.com/")
  })
})

describe("renderManifest", () => {
  const manifest = JSON.parse(renderManifest(site))

  it("names the demo and keeps the paper colour", () => {
    expect(manifest.name).toBe("Bench Bridge demo")
    expect(manifest.background_color).toBe(site.light.paper)
  })

  it("lists each app icon with its size", () => {
    expect(manifest.icons.map((icon: IconSize) => icon.sizes)).toEqual(["192x192", "512x512"])
  })
})

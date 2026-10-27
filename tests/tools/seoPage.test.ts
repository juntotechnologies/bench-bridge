/** Tests for the home page parts: head tags, JSON-LD, the noscript block, marker blocks and HTML helpers. */
import { describe, expect, it } from "vitest"
import { BODY_MARKERS, HEAD_MARKERS, fillBlock } from "../../tools/seo/blocks"
import { renderBodyLines } from "../../tools/seo/body"
import { renderHeadLines } from "../../tools/seo/head"
import { escapeHtml, indent, metaTag, safeJson } from "../../tools/seo/html"
import { buildJsonLd } from "../../tools/seo/jsonLd"
import { fixtureSite } from "./seoFixture"

const site = fixtureSite()
const head = renderHeadLines(site).join("\n")

describe("renderHeadLines", () => {
  it("holds the title, the description and the canonical link", () => {
    expect(head).toContain(`<title>${site.seo.title}</title>`)
    expect(head).toContain(`<meta name="description" content="${site.seo.description}" />`)
    expect(head).toContain('<link rel="canonical" href="https://bench-bridge.example.test/" />')
  })

  it("holds the Open Graph tags with an absolute image of 1200 by 630", () => {
    expect(head).toContain('<meta property="og:image" content="https://bench-bridge.example.test/og.png" />')
    expect(head).toContain('<meta property="og:image:width" content="1200" />')
    expect(head).toContain('<meta property="og:image:height" content="630" />')
    expect(head).toContain('<meta property="og:type" content="website" />')
  })

  it("holds the Twitter card, the icons, the manifest and a theme colour for each scheme", () => {
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(head).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />')
    expect(head).toContain('<link rel="manifest" href="/manifest.webmanifest" />')
    expect(head).toContain('media="(prefers-color-scheme: dark)"')
  })

  it("holds one JSON-LD script that parses", () => {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(head)?.[1] ?? ""
    expect(JSON.parse(json)["@graph"]).toHaveLength(2)
  })
})

describe("buildJsonLd", () => {
  const graph = buildJsonLd(site)["@graph"]
  const app = graph.find((node) => node["@type"] === "WebApplication")

  it("types the demo as a WebApplication, labelled as a demo", () => {
    expect(app?.["name"]).toBe("Bench Bridge demo")
    expect(app?.["applicationSubCategory"]).toBe("Demo with sample data")
  })

  it("ties the demo to the hub card and the maker", () => {
    expect(app?.["@id"]).toBe("https://juntotechnologies.com/#bench-bridge")
    expect(app?.["publisher"]).toEqual({ "@id": "https://juntotechnologies.com/#organization" })
  })

  it("holds no offer, so no price", () => {
    expect(JSON.stringify(graph)).not.toContain("offers")
  })
})

describe("renderBodyLines", () => {
  const body = renderBodyLines(site).join("\n")

  it("holds the demo name, the summary and the script note inside noscript", () => {
    expect(body.startsWith("<noscript>")).toBe(true)
    expect(body).toContain("<h1>Bench Bridge demo</h1>")
    expect(body).toContain(site.seo.needsScript)
  })

  it("links to the maker and leaves out the link to the demo itself", () => {
    expect(body).toContain('<a href="https://juntotechnologies.com/">Junto Technologies</a>')
    expect(body).not.toContain("Live demo")
  })
})

describe("fillBlock", () => {
  const html = `<head>\n    ${HEAD_MARKERS.start}\n    old\n    ${HEAD_MARKERS.end}\n  </head>`

  it("replaces what lies between the markers, one indent deep", () => {
    const out = fillBlock(html, HEAD_MARKERS, ["<a>", "<b>\n  <c>\n</b>"])
    expect(out).toBe(`<head>\n    ${HEAD_MARKERS.start}\n    <a>\n    <b>\n      <c>\n    </b>\n    ${HEAD_MARKERS.end}\n  </head>`)
  })

  it("gives the same text when it runs twice", () => {
    const once = fillBlock(html, HEAD_MARKERS, ["<a>"])
    expect(fillBlock(once, HEAD_MARKERS, ["<a>"])).toBe(once)
  })

  it("throws when a marker is missing", () => {
    expect(() => fillBlock(html, BODY_MARKERS, [])).toThrow("index.html must hold")
  })
})

describe("html helpers", () => {
  it("escapes the four unsafe characters", () => {
    expect(escapeHtml(`<a href="x">&`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;")
  })

  it("escapes content in a meta tag", () => {
    expect(metaTag("name", "k", 'a "b"')).toBe('<meta name="k" content="a &quot;b&quot;" />')
  })

  it("keeps a closing script tag out of JSON", () => {
    expect(safeJson({ text: "</script>" })).not.toContain("</script>")
  })

  it("indents every line by two spaces", () => {
    expect(indent("a\nb")).toBe("  a\n  b")
  })
})

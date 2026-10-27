/** A fixed Site for the SEO tests, built from the real seo.json and the real tokens, with small stand-in facts. */
import { Tokens } from "@design/schema"
import tokensJson from "@design/tokens.json"
import seoJson from "../../site/seo.json"
import { Seo } from "../../tools/seo/schema"
import { buildSite, type Site, type SiteInputs } from "../../tools/seo/site"

export function fixtureInputs(): SiteInputs {
  return {
    seo: Seo.parse(seoJson),
    product: "Bench Bridge",
    hub: { label: "Junto Technologies", href: "https://juntotechnologies.com/#bench-bridge" },
    homepage: "https://bench-bridge.example.test/",
    instruments: { live: ["pH meter", "HPLC system"], planned: ["CS vault and safe"] },
    stages: ["Capture", "Parse"],
    tokens: Tokens.parse(tokensJson),
    markPath: "M0 0h1",
    pages: [{ path: "/", lastmod: "2026-01-02" }],
  }
}

export function fixtureSite(): Site {
  return buildSite(fixtureInputs())
}

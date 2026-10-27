/** Builds the JSON-LD graph: the maker as an Organization and the demo as a WebApplication labelled as a demo. */
import type { Site } from "./site"
import { absoluteUrl } from "./urls"

export type JsonLdNode = Record<string, unknown>

export interface JsonLdGraph {
  "@context": string
  "@graph": JsonLdNode[]
}

function organizationId(site: Site): string {
  return `${site.maker.url}#organization`
}

function organizationNode(site: Site): JsonLdNode {
  return { "@type": "Organization", "@id": organizationId(site), name: site.maker.name, url: site.maker.url }
}

function describeFields(site: Site): JsonLdNode {
  const { seo } = site
  return {
    name: site.demoName,
    alternateName: site.name,
    description: seo.description,
    url: site.url,
    image: absoluteUrl(site, seo.og.path),
    inLanguage: seo.language,
  }
}

function categoryFields(site: Site): JsonLdNode {
  const { seo } = site
  return {
    applicationCategory: "BusinessApplication",
    applicationSubCategory: seo.tagline,
    operatingSystem: "Any",
    browserRequirements: seo.needsScript,
    featureList: site.stages,
    publisher: { "@id": organizationId(site) },
  }
}

function applicationNode(site: Site): JsonLdNode {
  return { "@type": "WebApplication", "@id": site.appId, ...describeFields(site), ...categoryFields(site) }
}

export function buildJsonLd(site: Site): JsonLdGraph {
  return { "@context": "https://schema.org", "@graph": [organizationNode(site), applicationNode(site)] }
}

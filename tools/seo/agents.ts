/** Renders agents.txt and .well-known/agents.json: what the site is and what an automated agent may do. */
import type { Site } from "./site"
import { FILE_NAMES, GENERATED_NOTE, absoluteUrl } from "./urls"

export interface AgentsJson {
  name: string
  url: string
  summary: string
  maker: string
  mayDo: string[]
  mayNotDo: string[]
  contact: string
  sitemap: string
  llms: string
}

function ruleLines(prefix: string, rules: string[]): string[] {
  return rules.map(ruleLine.bind(null, prefix))
}

function ruleLine(prefix: string, rule: string): string {
  return `${prefix}: ${rule}`
}

export function agentsData(site: Site): AgentsJson {
  const { agents } = site.seo
  return {
    name: site.name,
    url: site.url,
    summary: agents.summary,
    maker: site.maker.url,
    mayDo: agents.may,
    mayNotDo: agents.mayNot,
    contact: site.booking,
    sitemap: absoluteUrl(site, FILE_NAMES.sitemap),
    llms: absoluteUrl(site, FILE_NAMES.llms),
  }
}

function profileLines(data: AgentsJson): string[] {
  return [`Name: ${data.name}`, `Site: ${data.url}`, `Summary: ${data.summary}`, `Maker: ${data.maker}`]
}

function pointerLines(data: AgentsJson): string[] {
  return [`Contact: ${data.contact}`, `Sitemap: ${data.sitemap}`, `LLMs: ${data.llms}`]
}

export function renderAgentsTxt(site: Site): string {
  const data = agentsData(site)
  const rules = [...ruleLines("Allow", data.mayDo), ...ruleLines("Disallow", data.mayNotDo)]
  const lines = [`# ${GENERATED_NOTE}`, ...profileLines(data), ...rules, ...pointerLines(data)]
  return `${lines.join("\n")}\n`
}

export function renderAgentsJson(site: Site): string {
  return `${JSON.stringify(agentsData(site), null, 2)}\n`
}

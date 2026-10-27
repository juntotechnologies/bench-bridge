/** Renders llms.txt: a short markdown summary for language-model crawlers, with a link back to the maker. */
import { glossary, spellOut } from "../docs/glossary"
import type { ResolvedLink, Site } from "./site"

function bullet(text: string): string {
  return `- ${text}`
}

function linkLine(link: ResolvedLink): string {
  return `- [${link.label}](${link.url}): ${link.note}`
}

function section(title: string, lines: string[]): string {
  return `## ${title}\n\n${lines.join("\n")}`
}

function spelledList(names: string[]): string {
  return names.map(spellOut.bind(null, glossary)).join(", ")
}

function stageLine(site: Site): string {
  return `The bridge runs these steps in order: ${site.stages.join(", ")}.`
}

function instrumentLines(site: Site): string[] {
  return [
    `Run in the demo with sample data: ${spelledList(site.instruments.live)}.`,
    `Planned, with no demo yet: ${spelledList(site.instruments.planned)}.`,
  ]
}

export function renderLlms(site: Site): string {
  const parts = [
    `# ${site.name}`,
    `> ${site.seo.summary}`,
    section("What the demo shows", [...site.seo.shows.map(bullet), bullet(stageLine(site))]),
    section("Instruments", instrumentLines(site).map(bullet)),
    section("Limits", site.seo.limits.map(bullet)),
    section("Links", site.links.map(linkLine)),
  ]
  return `${parts.join("\n\n")}\n`
}

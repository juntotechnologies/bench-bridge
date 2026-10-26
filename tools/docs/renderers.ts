/** One renderer per generated block name: a fact, a file table, a directory table, a script table, the catalogue. */
import { catalog, copy, isLive } from "@shared/registry"
import type { Facts } from "./facts"
import type { Renderers } from "./markers"
import type { Notes } from "./notes"

export interface RenderInputs {
  facts: Facts
  notes: Notes
  scripts: string[]
  topDirs: string[]
  entriesOf: (dir: string) => string[]
  purposeOf: (dir: string) => string
}

export function createRenderers(inputs: RenderInputs): Renderers {
  return {
    fact: renderFact.bind(null, inputs.facts),
    files: renderFiles.bind(null, inputs),
    dirs: renderDirs.bind(null, inputs),
    scripts: renderScripts.bind(null, inputs),
    catalog: renderCatalog,
  }
}

export function markdownTable(headers: string[], rows: string[][]): string {
  const lines = [headers, headers.map(dashes), ...rows].map(asRow)
  return `\n${lines.join("\n")}\n`
}

function dashes(header: string): string {
  return "-".repeat(Math.max(3, header.length))
}

function asRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`
}

function renderFact(facts: Facts, key: string): string {
  const value = facts[key]
  if (value === undefined) throw new Error(`unknown fact: ${key}`)
  return value
}

function renderFiles(inputs: RenderInputs, dir: string): string {
  const rows = inputs.entriesOf(dir).map(fileRow.bind(null, inputs.notes, dir))
  return markdownTable(["File", "Holds"], rows)
}

function fileRow(notes: Notes, dir: string, name: string): string[] {
  const note = notes.files[`${dir}/${name}`]
  if (note === undefined) throw new Error(`missing note for ${dir}/${name}: add it to tools/docs/notes.json`)
  return [`\`${name}\``, note]
}

function renderDirs(inputs: RenderInputs): string {
  const rows = inputs.topDirs.map(dirRow.bind(null, inputs))
  return markdownTable(["Directory", "Holds"], rows)
}

function dirRow(inputs: RenderInputs, dir: string): string[] {
  return [`\`${dir}/\``, inputs.purposeOf(dir)]
}

function renderScripts(inputs: RenderInputs): string {
  const rows = inputs.scripts.map(scriptRow.bind(null, inputs.notes))
  return markdownTable(["Command", "Does"], rows)
}

function scriptRow(notes: Notes, name: string): string[] {
  const note = notes.scripts[name]
  if (note === undefined) throw new Error(`missing note for script ${name}: add it to tools/docs/notes.json`)
  return [`\`npm run ${name}\``, note]
}

function renderCatalog(): string {
  return markdownTable(["#", "Instrument", "Interface", "Era", "Status", "Why it matters"], catalog.map(catalogRow))
}

function catalogRow(entry: (typeof catalog)[number], index: number): string[] {
  const status = isLive(entry) ? copy.status.bridged : copy.status.planned
  return [String(index + 1), entry.name, entry.interface, entry.era, status, entry.why]
}

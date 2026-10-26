/** Docs sync: fills every generated block from its source (--write), or fails when a doc is stale or names something missing. */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import shape from "../../code-shape.json" with { type: "json" }
import pkg from "../../package.json" with { type: "json" }
import { listDirs, listEntries, listMarkdown } from "../repo-files"
import { buildFacts } from "./facts"
import { applyBlocks, type Renderers } from "./markers"
import { bareInitialisms, glossary, type BareHit } from "./glossary"
import { notes, staleNotes } from "./notes"
import { npmScriptRefs, pathRefs, unknownNames } from "./references"
import { createRenderers, type RenderInputs } from "./renderers"

const ROOT = process.cwd()
const SCRIPTS = Object.keys(pkg.scripts)

interface SyncContext {
  renderers: Renderers
  write: boolean
}

interface Applied {
  text: string
  problems: string[]
}

function purposeOf(dir: string): string {
  const lines = readFileSync(join(ROOT, dir, "AGENTS.md"), "utf8").split("\n")
  return lines.slice(1).find(isContent) ?? ""
}

function isContent(line: string): boolean {
  return line.trim() !== ""
}

function loadInputs(): RenderInputs {
  const topDirs = listDirs(ROOT).map(rel).filter(isTopLevel)
  return { facts: buildFacts(), notes, scripts: SCRIPTS, topDirs, entriesOf, purposeOf }
}

function entriesOf(dir: string): string[] {
  return listEntries(join(ROOT, dir))
}

function rel(path: string): string {
  return relative(ROOT, path)
}

function isTopLevel(path: string): boolean {
  return !path.includes("/")
}

function applyOrReport(renderers: Renderers, path: string, text: string): Applied {
  try {
    return { text: applyBlocks(text, renderers), problems: [] }
  } catch (error) {
    return { text, problems: [`${rel(path)}: ${(error as Error).message}`] }
  }
}

function referenceProblems(path: string, text: string): string[] {
  if (shape.docsCheckIgnore.includes(rel(path))) return []
  const scripts = unknownNames(npmScriptRefs(text), SCRIPTS).map(scriptProblem.bind(null, path))
  const missing = pathRefs(text).filter(isMissingPath.bind(null, path)).map(fileProblem.bind(null, path))
  return [...scripts, ...missing]
}

function spellOutProblems(path: string, text: string): string[] {
  if (!shape.spellOutDocs.includes(rel(path))) return []
  return bareInitialisms(glossary, text).map(bareProblem.bind(null, path))
}

function bareProblem(doc: string, hit: BareHit): string {
  return `${rel(doc)}:${hit.line}: bare initialism ${hit.key}: use a term block`
}

function scriptProblem(doc: string, name: string): string {
  return `${rel(doc)}: no npm script "${name}"`
}

function fileProblem(doc: string, ref: string): string {
  return `${rel(doc)}: no file ${ref}`
}

function isMissingPath(doc: string, ref: string): boolean {
  return !existsSync(join(dirname(doc), ref)) && !existsSync(join(ROOT, ref))
}

function existsInRoot(path: string): boolean {
  return existsSync(join(ROOT, path))
}

function syncFile(context: SyncContext, path: string): string[] {
  const text = readFileSync(path, "utf8")
  const applied = applyOrReport(context.renderers, path, text)
  const stale = applied.text !== text
  if (stale && context.write) writeFileSync(path, applied.text)
  const outOfDate = stale && !context.write ? [`${rel(path)}: out of date, run npm run docs`] : []
  return [...applied.problems, ...outOfDate, ...referenceProblems(path, applied.text), ...spellOutProblems(path, applied.text)]
}

function main(): void {
  const context: SyncContext = { renderers: createRenderers(loadInputs()), write: process.argv.includes("--write") }
  const problems = listMarkdown(ROOT).flatMap(syncFile.bind(null, context))
  const stale = staleNotes(notes, existsInRoot, { scripts: SCRIPTS, generators: Object.keys(context.renderers) })
  const all = [...problems, ...stale]
  all.forEach(report)
  process.exitCode = all.length ? 1 : 0
}

function report(problem: string): void {
  console.error(problem)
}

main()

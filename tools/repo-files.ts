/** Repo file walks: checked directories, their entries and their markdown files. */
import { readdirSync, type Dirent } from "node:fs"
import { join } from "node:path"
import shape from "../code-shape.json" with { type: "json" }

const AGENTS_FILE = "AGENTS.md"

export function isCheckedName(name: string): boolean {
  return !name.startsWith(".") && !shape.agentsMdIgnore.includes(name)
}

export function listDirs(dir: string): string[] {
  const names = readdirSync(dir, { withFileTypes: true }).filter(isCheckedDir).map(plainName)
  return names.flatMap(withChildren.bind(null, dir))
}

export function listMarkdown(root: string): string[] {
  return [root, ...listDirs(root)].flatMap(markdownIn)
}

/** Entries of one directory, directories marked with a trailing slash. AGENTS.md is left out. */
export function listEntries(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).filter(isListed).map(entryName).sort()
}

function markdownIn(dir: string): string[] {
  const files = readdirSync(dir, { withFileTypes: true }).filter(isMarkdownFile)
  return files.map(plainName).map(joinTo.bind(null, dir))
}

function joinTo(dir: string, name: string): string {
  return join(dir, name)
}

function withChildren(parent: string, name: string): string[] {
  const path = join(parent, name)
  return [path, ...listDirs(path)]
}

function isCheckedDir(entry: Dirent): boolean {
  return entry.isDirectory() && isCheckedName(entry.name)
}

function isMarkdownFile(entry: Dirent): boolean {
  return entry.isFile() && entry.name.endsWith(".md")
}

function isListed(entry: Dirent): boolean {
  return entry.name !== AGENTS_FILE && isCheckedName(entry.name)
}

function plainName(entry: Dirent): string {
  return entry.name
}

function entryName(entry: Dirent): string {
  return entry.isDirectory() ? `${entry.name}/` : entry.name
}

/** Pure helpers for the AGENTS.md check: which directories are checked and which lack the file. */
import { readdirSync, type Dirent } from "node:fs"
import { join } from "node:path"
import shape from "../code-shape.json" with { type: "json" }

export function isCheckedName(name: string): boolean {
  return !name.startsWith(".") && !shape.agentsMdIgnore.includes(name)
}

export function listDirs(dir: string): string[] {
  const names = readdirSync(dir, { withFileTypes: true }).filter(isCheckedDir).map(nameOf)
  return names.flatMap(withChildren.bind(null, dir))
}

function isCheckedDir(entry: Dirent): boolean {
  return entry.isDirectory() && isCheckedName(entry.name)
}

function nameOf(entry: Dirent): string {
  return entry.name
}

function withChildren(parent: string, name: string): string[] {
  const path = join(parent, name)
  return [path, ...listDirs(path)]
}

export function missingAgentsMd(dirs: string[], has: (dir: string) => boolean): string[] {
  return dirs.filter(isMissing.bind(null, has))
}

function isMissing(has: (dir: string) => boolean, dir: string): boolean {
  return !has(dir)
}

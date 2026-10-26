/** Repo check: fails when a directory has no AGENTS.md, so every directory states its own rules. */
import { existsSync } from "node:fs"
import { join } from "node:path"
import { listDirs, missingAgentsMd } from "./agents-md"

const ROOT = process.cwd()

function hasAgentsMd(dir: string): boolean {
  return existsSync(join(dir, "AGENTS.md"))
}

function report(dir: string): void {
  console.error(`missing AGENTS.md: ${dir.replace(ROOT, ".")}`)
}

function main(): void {
  const missing = missingAgentsMd([ROOT, ...listDirs(ROOT)], hasAgentsMd)
  missing.forEach(report)
  process.exitCode = missing.length ? 1 : 0
}

main()

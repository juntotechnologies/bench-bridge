/** Pure helper for the AGENTS.md check: which of the given directories lack the file. */

export function missingAgentsMd(dirs: string[], has: (dir: string) => boolean): string[] {
  return dirs.filter(isMissing.bind(null, has))
}

function isMissing(has: (dir: string) => boolean, dir: string): boolean {
  return !has(dir)
}

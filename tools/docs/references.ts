/** Finds what a doc names: npm scripts and file paths in backticks, so a rename cannot leave a stale doc. */

const NPM_RUN = /npm run ([\w:-]+)/g
const FILE_IN_TICKS = /`([\w./@-]+\.(?:ts|js|mjs|json|md|css|html))`/g

export function npmScriptRefs(text: string): string[] {
  return [...text.matchAll(NPM_RUN)].map(firstGroup)
}

export function pathRefs(text: string): string[] {
  return [...text.matchAll(FILE_IN_TICKS)].map(firstGroup)
}

function firstGroup(match: RegExpMatchArray): string {
  return match[1] as string
}

/** Names that are not in the allowed list, without repeats. */
export function unknownNames(names: string[], allowed: string[]): string[] {
  return [...new Set(names)].filter(isOutside.bind(null, allowed))
}

function isOutside(allowed: string[], name: string): boolean {
  return !allowed.includes(name)
}

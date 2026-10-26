/** Splits one line of JSON text into typed tokens, for the colours of the code block. */
export type TokenKind = "key" | "string" | "number" | "literal" | "punct" | "space" | "text"

export interface Token {
  kind: TokenKind
  text: string
}

const TOKEN =
  /(?<key>"(?:[^"\\]|\\.)*")(?=\s*:)|(?<string>"(?:[^"\\]|\\.)*")|(?<number>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(?<literal>true|false|null)|(?<punct>[{}[\],:])|(?<space>\s+)|(?<text>.)/g

export function tokenizeJson(line: string): Token[] {
  return [...line.matchAll(TOKEN)].map(toToken)
}

function toToken(match: RegExpMatchArray): Token {
  const groups = match.groups ?? {}
  const kind = (Object.keys(groups) as TokenKind[]).find(isMatched.bind(null, groups)) ?? "text"
  return { kind, text: match[0] }
}

function isMatched(groups: Record<string, string | undefined>, name: string): boolean {
  return groups[name] !== undefined
}

/** Small HTML helpers: escaping, meta tags and JSON that is safe inside a script tag. */

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }

function escapeChar(char: string): string {
  return ESCAPES[char] ?? char
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, escapeChar)
}

export function metaTag(attribute: "name" | "property", key: string, value: string): string {
  return `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`
}

/** JSON for a script tag: a less-than sign becomes an escape so no text can close the tag. */
export function safeJson(value: object): string {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c")
}

function indentLine(line: string): string {
  return `  ${line}`
}

export function indent(text: string): string {
  return text.split("\n").map(indentLine).join("\n")
}

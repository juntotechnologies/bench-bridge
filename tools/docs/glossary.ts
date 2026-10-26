/** Glossary of initialisms: spells each one out as "expansion (KEY)" and finds bare ones in a doc. */
import { z } from "zod"
import glossaryJson from "./glossary.json"

export const GlossaryEntry = z.object({ expansion: z.string(), meaning: z.string() })

export type GlossaryEntry = z.infer<typeof GlossaryEntry>

export const Glossary = z.record(z.string(), GlossaryEntry)

export type Glossary = z.infer<typeof Glossary>

export interface BareHit {
  key: string
  line: number
}

export const glossary = Glossary.parse(glossaryJson)

/** The initialism spelled out: "Laboratory Information Management System (LIMS)". */
export function spelled(source: Glossary, key: string, capitalize: boolean): string {
  const entry = source[key]
  if (!entry) throw new Error(`unknown initialism: ${key}`)
  const words = capitalize ? upperFirst(entry.expansion) : entry.expansion
  return `${words} (${key})`
}

/** Spells out every bare initialism in a text, in one pass, so no expansion is expanded again. */
export function spellOut(source: Glossary, text: string): string {
  return text.replace(keyPattern(source), expandKey.bind(null, source))
}

/** Initialisms that are not in the spelled-out form, ignoring inline code and generator markers. */
export function bareInitialisms(source: Glossary, text: string): BareHit[] {
  const visible = Object.keys(source).sort(longestFirst).reduce(blankSpelled.bind(null, source), blankCode(text))
  return [...visible.matchAll(keyPattern(source))].map(hitAt.bind(null, visible))
}

function expandKey(source: Glossary, key: string): string {
  return spelled(source, key, false)
}

function keyPattern(source: Glossary): RegExp {
  const keys = Object.keys(source).sort(longestFirst).map(escapeRegex)
  return new RegExp(`\\b(${keys.join("|")})\\b`, "g")
}

function longestFirst(a: string, b: string): number {
  return b.length - a.length
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function blankCode(text: string): string {
  return text.replace(/`[^`\n]*`|<!--[\s\S]*?-->/g, blank)
}

function blank(match: string): string {
  return match.replace(/[^\n]/g, " ")
}

function blankSpelled(source: Glossary, text: string, key: string): string {
  const expansion = source[key]?.expansion ?? ""
  const first = expansion.charAt(0)
  const head = `[${first.toLowerCase()}${first.toUpperCase()}]`
  return text.replace(new RegExp(`${head}${escapeRegex(expansion.slice(1))} \\(${escapeRegex(key)}\\)`, "g"), blank)
}

function hitAt(text: string, match: RegExpMatchArray): BareHit {
  return { key: match[1] as string, line: text.slice(0, match.index).split("\n").length }
}

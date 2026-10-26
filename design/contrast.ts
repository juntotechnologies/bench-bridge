/** Contrast checks: WCAG contrast ratios for the colour pairs that must stay readable in both themes. */
import type { Contrast, Spec, Token } from "./schema"

type Theme = "light" | "dark"
type Pair = Contrast[number]

const THEMES: Theme[] = ["light", "dark"]
const HEX = /^#([0-9a-fA-F]{6})$/
const WEIGHTS = [0.2126, 0.7152, 0.0722]
const LINEAR_CUTOFF = 0.03928

function channel(hex: string, start: number): number {
  const value = parseInt(hex.slice(start, start + 2), 16) / 255
  return value <= LINEAR_CUTOFF ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function hexOf(color: string): string {
  return HEX.exec(color)?.[1] ?? "000000"
}

function weighted(hex: string, weight: number, index: number): number {
  return weight * channel(hex, index * 2)
}

function add(sum: number, value: number): number {
  return sum + value
}

function luminance(color: string): number {
  return WEIGHTS.map(weighted.bind(null, hexOf(color))).reduce(add, 0)
}

export function contrastRatio(fg: string, bg: string): number {
  const [light, dark] = [luminance(fg), luminance(bg)].sort(descending)
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

function descending(a: number, b: number): number {
  return b - a
}

/** The value of a colour token in a theme. A token with no dark value keeps its light value. */
export function colorIn(spec: Spec, name: string, theme: Theme): string {
  return valueIn(spec.tokens["color"]?.[name], theme)
}

function valueIn(token: Token | undefined, theme: Theme): string {
  if (!token) return ""
  return (theme === "dark" ? token.dark : undefined) ?? token.value
}

function problemOf(spec: Spec, pair: Pair, theme: Theme): string | null {
  const ratio = ratioIn(spec, pair, theme)
  const label = `${theme} ${pair.fg} on ${pair.bg}`
  return ratio >= pair.min ? null : `${label}: contrast ${ratio.toFixed(2)} is below ${pair.min}`
}

function isProblem(problem: string | null): problem is string {
  return problem !== null
}

function pairProblems(spec: Spec, pair: Pair): string[] {
  return THEMES.map(problemOf.bind(null, spec, pair)).filter(isProblem)
}

export function contrastProblems(spec: Spec): string[] {
  return spec.contrast.flatMap(pairProblems.bind(null, spec))
}

/** The ratio of a pair in both themes, for the readable spec. */
export function pairRatios(spec: Spec, pair: Pair): [number, number] {
  const [light, dark] = THEMES.map(ratioIn.bind(null, spec, pair))
  return [light ?? 0, dark ?? 0]
}

function ratioIn(spec: Spec, pair: Pair, theme: Theme): number {
  return contrastRatio(colorIn(spec, pair.fg, theme), colorIn(spec, pair.bg, theme))
}

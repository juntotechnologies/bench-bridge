/** Cross-file checks that a schema cannot express: unique token names and tokens that components name. */
import { tokenNames } from "./css"
import type { Components, Spec } from "./schema"

function isRepeat(names: string[], name: string, index: number): boolean {
  return names.indexOf(name) !== index
}

function isMissing(known: string[], name: string): boolean {
  return !known.includes(name)
}

function repeatProblem(name: string): string {
  return `duplicate token: ${name}`
}

function unknownProblem(name: string): string {
  return `component names an unknown token: ${name}`
}

function componentTokens(component: Components[number]): string[] {
  return component.tokens
}

export function specProblems(spec: Spec): string[] {
  const known = tokenNames(spec.tokens)
  const used = spec.components.flatMap(componentTokens)
  return [...known.filter(isRepeat.bind(null, known)).map(repeatProblem), ...used.filter(isMissing.bind(null, known)).map(unknownProblem)]
}

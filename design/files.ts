/** The one module that knows the spec file layout: it reads the sources and writes or compares the outputs. */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { Components, Contrast, Layout, Principles, Tokens, Viewports, type Spec } from "./schema"

export const SOURCES = ["tokens.json", "layout.json", "viewports.json", "components.json", "principles.json", "contrast.json"] as const
export const OUTPUTS = ["tokens.css", "SPEC.md", "spec.lock"] as const

export type Outputs = Record<(typeof OUTPUTS)[number], string>

export function readText(dir: string, name: string): string {
  return readFileSync(join(dir, name), "utf8")
}

function readJson(dir: string, name: string): unknown {
  return JSON.parse(readText(dir, name))
}

export function readSpec(dir: string): Spec {
  return {
    tokens: Tokens.parse(readJson(dir, "tokens.json")),
    layout: Layout.parse(readJson(dir, "layout.json")),
    viewports: Viewports.parse(readJson(dir, "viewports.json")),
    components: Components.parse(readJson(dir, "components.json")),
    principles: Principles.parse(readJson(dir, "principles.json")),
    contrast: Contrast.parse(readJson(dir, "contrast.json")),
  }
}

export function sourceTexts(dir: string): string[] {
  return SOURCES.map(readText.bind(null, dir))
}

export function writeOutputs(dir: string, outputs: Outputs): void {
  for (const name of OUTPUTS) writeFileSync(join(dir, name), outputs[name])
}

/** The outputs whose file is missing or differs from what the sources produce. */
export function staleOutputs(dir: string, outputs: Outputs): string[] {
  return OUTPUTS.filter(isStale.bind(null, dir, outputs))
}

function isStale(dir: string, outputs: Outputs, name: (typeof OUTPUTS)[number]): boolean {
  return !existsSync(join(dir, name)) || readText(dir, name) !== outputs[name]
}

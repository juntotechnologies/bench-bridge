/** Design spec build: writes tokens.css, SPEC.md and spec.lock from the JSON sources, or fails with --check when they are stale. */
import { fileURLToPath } from "node:url"
import { specProblems } from "./check"
import { tokenCss } from "./css"
import { readSpec, sourceTexts, staleOutputs, writeOutputs, type Outputs } from "./files"
import { lockText } from "./lock"
import { specMarkdown } from "./spec"

const DIR = fileURLToPath(new URL(".", import.meta.url))

function render(dir: string): Outputs {
  const spec = readSpec(dir)
  const problems = specProblems(spec)
  if (problems.length) throw new Error(problems.join("; "))
  return { "tokens.css": tokenCss(spec.tokens), "SPEC.md": specMarkdown(spec), "spec.lock": lockText(sourceTexts(dir)) }
}

function main(argv: string[]): number {
  const outputs = render(DIR)
  if (!argv.includes("--check")) return write(outputs)
  const stale = staleOutputs(DIR, outputs)
  stale.forEach(report)
  return stale.length ? 1 : 0
}

function write(outputs: Outputs): number {
  writeOutputs(DIR, outputs)
  console.log("design spec written")
  return 0
}

function report(name: string): void {
  console.error(`design/${name} is stale: run npm run design`)
}

process.exitCode = main(process.argv.slice(2))

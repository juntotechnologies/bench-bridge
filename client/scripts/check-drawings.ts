/** Drawing check: draws every instrument and every kit under Node, and fails when a part or a builder has no match. */
import { devices, kitParts, kits, partsOf, type Identified } from "@shared/registry"
import type { Kit, KitPart } from "@shared/registry/schema"
import { drawById, drawKit } from "../drawings/draw"
import { BUILDERS } from "../drawings/kits/models"

function notDrawn(markup: string, part: KitPart): boolean {
  return !markup.includes(`data-item="${part.id}"`) || !markup.includes(`data-name="${part.name}"`)
}

function partProblem(kit: Kit, part: KitPart): string {
  return `kit ${kit.id}: part ${part.id} is not in the drawing`
}

function undrawnParts(kit: Kit): string[] {
  const { markup } = drawKit(kit, { explosion: 1, annotate: false })
  return partsOf(kit).filter(notDrawn.bind(null, markup)).map(partProblem.bind(null, kit))
}

function identifier(item: Identified): string {
  return item.id
}

function unmatched(label: string, known: Set<string>, id: string): string[] {
  return known.has(id) ? [] : [`${label}: ${id}`]
}

/** Builders and registry parts must be the same set, so a new part cannot ship without a drawing. */
function builderProblems(): string[] {
  const built = Object.keys(BUILDERS)
  const listed = kitParts.map(identifier)
  return [...listed.flatMap(unmatched.bind(null, "part has no builder", new Set(built))), ...built.flatMap(unmatched.bind(null, "builder has no part", new Set(listed)))]
}

function deviceProblem(device: Identified): string[] {
  return drawById(device.id, { explosion: 1 }).markup.includes("<g") ? [] : [`device ${device.id}: empty drawing`]
}

function problems(): string[] {
  return [...builderProblems(), ...kits.flatMap(undrawnParts), ...devices.flatMap(deviceProblem)]
}

function report(problem: string): void {
  console.error(problem)
}

function main(): void {
  const found = problems()
  found.forEach(report)
  console.log(found.length ? `${found.length} drawing problems` : `drawings ok: ${devices.length} instruments, ${kits.length} kits`)
  process.exitCode = found.length ? 1 : 0
}

main()

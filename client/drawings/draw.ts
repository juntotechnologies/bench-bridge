/** Draws one drawing by ID: an instrument from its model, or a bridge kit from its kit model and the registry's part names. */
import { deviceById, kitById, kitTitle, partsOf } from "@shared/registry"
import type { Device, Kit, KitPart } from "@shared/registry/schema"
import { P, type RenderOptions, type RenderResult } from "./engine"
import { kitIdOf } from "./ids"
import { KIT_MODELS } from "./kits/models"
import type { PartNames } from "./kits/types"
import { MODELS } from "./models"

export type DrawOptions = Omit<RenderOptions, "camera">

export function drawDevice(device: Device, options: DrawOptions): RenderResult {
  const model = MODELS[device.id]
  if (!model) throw Error(`No drawing model for ${device.id}`)
  const parts = model.build({ kit: kitTitle(device), connector: device.port.connector })
  return P.render(parts, { ...options, camera: model.camera })
}

function nameEntry(part: KitPart): [string, string] {
  return [part.id, part.name]
}

function namesOf(kit: Kit): PartNames {
  return Object.fromEntries(partsOf(kit).map(nameEntry))
}

export function drawKit(kit: Kit, options: DrawOptions): RenderResult {
  const model = KIT_MODELS[kit.id]
  if (!model) throw Error(`No drawing model for kit ${kit.id}`)
  return P.render(model.build(namesOf(kit)), { ...options, camera: model.camera })
}

/** The drawing with this ID, or an error that names the missing device or kit. */
export function drawById(id: string, options: DrawOptions): RenderResult {
  const kitId = kitIdOf(id)
  if (kitId === null) return drawDevice(required(deviceById(id), id), options)
  return drawKit(required(kitById(kitId), id), options)
}

function required<T>(found: T | undefined, id: string): T {
  if (found === undefined) throw Error(`Unknown drawing ${id}`)
  return found
}

import type { Device } from "@shared/registry/schema"
import { P, type RenderOptions, type RenderResult } from "./engine"
import { MODELS } from "./models"

export type DrawOptions = Omit<RenderOptions, "camera">

export function drawDevice(device: Device, options: DrawOptions): RenderResult {
  const model = MODELS[device.id]
  if (!model) throw Error(`No drawing model for ${device.id}`)
  const parts = model.build({ kit: device.kit, connector: device.port.connector })
  return P.render(parts, { ...options, camera: model.camera })
}

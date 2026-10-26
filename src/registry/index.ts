import { z } from "zod"
import devicesJson from "../../data/devices.json"
import targetsJson from "../../data/targets.json"
import pipelineJson from "../../data/pipeline.json"
import copyJson from "../../data/copy.json"
import { Device, Stage, Target } from "./schema"

export const devices = z.array(Device).parse(devicesJson)
export const targets = z.record(z.enum(["lims", "inventory", "erp"]), Target).parse(targetsJson)
export const stages = z.array(Stage).parse(pipelineJson)
export const copy = copyJson

export function deviceById(id: string): Device | undefined {
  return devices.find(matchesId.bind(null, id))
}

function matchesId(id: string, device: Device): boolean {
  return device.id === id
}

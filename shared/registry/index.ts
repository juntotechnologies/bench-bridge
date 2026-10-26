/** Loads and validates the JSON registries once, and exports them as typed values. */
import { z } from "zod"
import devicesJson from "../data/devices.json"
import targetsJson from "../data/targets.json"
import catalogJson from "../data/catalog.json"
import pipelineJson from "../data/pipeline.json"
import copyJson from "../data/copy.json"
import { CatalogEntry, Device, Stage, Target, TargetId } from "./schema"

export const devices = z.array(Device).parse(devicesJson)
export const targets = z.record(TargetId, Target).parse(targetsJson)
export const catalog = z.array(CatalogEntry).parse(catalogJson)
export const stages = z.array(Stage).parse(pipelineJson)
export const copy = copyJson

export function deviceById(id: string): Device | undefined {
  return devices.find(matchesId.bind(null, id))
}

function matchesId(id: string, device: Device): boolean {
  return device.id === id
}

/** An instrument is live when it has a full bridge config in data/devices.json. */
export function isLive(entry: CatalogEntry): boolean {
  return deviceById(entry.id) !== undefined
}

/** Loads and validates the JSON registries once, and exports them as typed values. */
import { z } from "zod"
import devicesJson from "../data/devices.json"
import targetsJson from "../data/targets.json"
import catalogJson from "../data/catalog.json"
import pipelineJson from "../data/pipeline.json"
import copyJson from "../data/copy.json"
import kitsJson from "../data/kits.json"
import { CatalogEntry, Device, KitFile, Stage, Target, TargetId, type Connection, type Kit, type KitPart } from "./schema"

export const devices = z.array(Device).parse(devicesJson)
export const targets = z.record(TargetId, Target).parse(targetsJson)
export const catalog = z.array(CatalogEntry).parse(catalogJson)
export const stages = z.array(Stage).parse(pipelineJson)
export const copy = copyJson

const kitFile = KitFile.parse(kitsJson)
export const kits = kitFile.kits
export const kitParts = kitFile.parts
export const kitChecks = kitFile.checks
export const kitSafeguards = kitFile.safeguards

export function deviceById(id: string): Device | undefined {
  return devices.find(matchesId.bind(null, id))
}

export interface Identified {
  id: string
}

function matchesId(id: string, item: Identified): boolean {
  return item.id === id
}

export function kitById(id: string): Kit | undefined {
  return kits.find(matchesId.bind(null, id))
}

/** The kit and its pass-through connector as one line, such as "Serial tap with DB9 pass-through". */
export function kitTitle(device: Device): string {
  const kit = kitById(device.kit)
  return `${kit?.name ?? device.kit} with ${device.port.connector.split(" ")[0]} pass-through`
}

/** The parts of a kit, in the order the kit lists them. */
export function partsOf(kit: Kit): KitPart[] {
  return kit.parts.flatMap(partById)
}

function partById(id: string): KitPart[] {
  return kitParts.filter(matchesId.bind(null, id))
}

export function catalogById(id: string): CatalogEntry | undefined {
  return catalog.find(matchesId.bind(null, id))
}

/** The label of a connection type, such as "IEEE-488 (GPIB)". copy.json owns the labels. */
export function connectionLabel(connection: Connection): string {
  return copy.connections.find(matchesId.bind(null, connection))?.label ?? connection
}

/** A live device's connection type, from its catalogue entry. A test checks that every device has one. */
export function connectionOf(device: Device): Connection {
  return catalogById(device.id)?.connection ?? "other"
}

/** The port kind that the Port and Data tabs show, such as "RS-232". */
export function portKind(device: Device): string {
  return connectionLabel(connectionOf(device))
}

/** An instrument is live when it has a full bridge config in data/devices.json. */
export function isLive(entry: CatalogEntry): boolean {
  return deviceById(entry.id) !== undefined
}

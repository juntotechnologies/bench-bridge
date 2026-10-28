/** The kit drawing models: one per kit, built from the part builders for the parts that the registry lists. */
import type { Part } from "../engine"
import { clock, computer, isolator, power, storage } from "./boards"
import { CONNECTORS } from "./outlines"
import { caseFloor, lid, portIn, portOut, portShare, uplink } from "./shell"
import { readerShare, tapGpib, tapNetwork, tapSerial } from "./taps"
import { KIT_CAMERA, type Connector, type KitModel, type PartBuilder, type PartNames } from "./types"

/** Part builder by part ID. A test fails when a part in kits.json has no builder here. */
export const BUILDERS: Record<string, PartBuilder> = {
  case: caseFloor,
  lid,
  "port-in": portIn,
  "port-out": portOut,
  "port-share": portShare,
  uplink,
  "tap-serial": tapSerial,
  "tap-network": tapNetwork,
  "tap-gpib": tapGpib,
  "reader-share": readerShare,
  computer,
  storage,
  clock,
  isolator,
  power,
}

function buildPart(names: PartNames, connector: Connector, id: string): Part {
  const builder = BUILDERS[id]
  if (!builder) throw Error(`No drawing for kit part ${id}`)
  return builder({ name: names[id] ?? id, connector })
}

function build(connector: Connector, names: PartNames): Part[] {
  return Object.keys(names).map(buildPart.bind(null, names, connector))
}

function modelOf(connector: Connector): KitModel {
  return { camera: KIT_CAMERA, build: build.bind(null, connector) }
}

/** Keyed by kit ID in shared/data/kits.json. */
export const KIT_MODELS: Record<string, KitModel> = Object.fromEntries(Object.entries(CONNECTORS).map(entryModel))

function entryModel([id, connector]: [string, Connector]): [string, KitModel] {
  return [id, modelOf(connector)]
}

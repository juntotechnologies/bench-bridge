/** Drawing model of the HPLC system: a stack of modules under a solvent tray, with the network tap on the detector. */
import { G, type Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const HALF_WIDTH = 110
const FRONT = -130
const BACK = 130
const HEIGHT = 52
const LIFT = 38
const FACE = FRONT - 0.05
const MODULES = 4
const TOP = MODULES * HEIGHT
const TOP_LIFT = MODULES * LIFT

interface ModuleSpec {
  id: string
  name: string
  level: number
}

/** One box of the stack. Level 0 is the detector at the bottom; each level up lifts further when exploded. */
function stackModule(spec: ModuleSpec): Part {
  const z = spec.level * HEIGHT
  const corners: [[number, number, number], [number, number, number]] = [[-HALF_WIDTH, FRONT, z], [HALF_WIDTH, BACK, z + HEIGHT]]
  return block({ id: spec.id, name: spec.name, corners, explosion: [0, 0, spec.level * LIFT], radius: 5 })
}

function detector(): Part {
  const p = stackModule({ id: "detector", name: "UV detector", level: 0 })
  frontRect(p, FACE, [-90, 16], [-40, 36])
  G.circle(p, [70, FACE, 26], 4, [0, -1, 0], { role: "detail" })
  return p
}

function columnOven(): Part {
  const p = stackModule({ id: "oven", name: "Column oven", level: 1 })
  const z = HEIGHT
  frontRect(p, FACE, [-95, z + 8], [95, z + 44])
  G.line(p, [0, FACE, z + 8], [0, FACE, z + 44], "detail")
  return p
}

function autosampler(): Part {
  const p = stackModule({ id: "sampler", name: "Autosampler", level: 2 })
  const z = 2 * HEIGHT
  frontRect(p, FACE, [-90, z + 8], [40, z + 44])
  frontRect(p, FACE, [52, z + 20], [86, z + 32])
  return p
}

function pump(): Part {
  const p = stackModule({ id: "pump", name: "Quaternary pump", level: 3 })
  const z = 3 * HEIGHT
  frontRect(p, FACE, [-90, z + 14], [-30, z + 38])
  for (const x of [50, 80]) G.circle(p, [x, FACE, z + 26], 9, [0, -1, 0], { role: "detail" })
  return p
}

function trayDeck(): Part {
  const corners: [[number, number, number], [number, number, number]] = [[-100, -100, TOP], [100, 100, TOP + 10]]
  return block({ id: "tray", name: "Solvent tray", corners, explosion: [0, 0, TOP_LIFT + 14], radius: 4 })
}

function bottles(): Part {
  const p = G.part("bottles", "Solvent bottles")
  const profile: [number, number][] = [[0, 0], [0, 17], [46, 17], [52, 8], [60, 8], [60, 0]]
  for (const x of [-66, -22, 22, 66]) G.lathe(p, profile, { axis: "z", at: [x, 0, TOP + 10], creaseAngle: 20 })
  p.explosion = [0, 0, TOP_LIFT + 50]
  return p
}

function build(labels: Labels): Part[] {
  const tap = portAndTap(labels, { faceX: -HALF_WIDTH, y: 40, z: 26 })
  return [detector(), columnOven(), autosampler(), pump(), trayDeck(), bottles(), ...tap]
}

export const hplc: DrawingModel = { camera: DEFAULT_CAMERA, build }

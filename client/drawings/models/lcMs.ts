/** Drawing model of the LC-MS/MS: a data system computer, a liquid chromatograph stack, and a triple quadrupole mass spectrometer with its ion source and pump. */
import { G, type Part, type Vec3 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const PC_LEFT = -200
const PC_RIGHT = -150
const LC_LEFT = -130
const LC_RIGHT = -30
const LC_LEVEL = 40
const MS_LEFT = 0
const MS_RIGHT = 170
const MS_TOP = 110
const HALF_DEPTH = 75
const FACE = -HALF_DEPTH - 0.05

interface StackSpec {
  id: string
  name: string
  level: number
}

/** The data system computer: it writes each results file to the network share. The kit joins it on the network. */
function computer(): Part {
  const corners: [Vec3, Vec3] = [[PC_LEFT, -HALF_DEPTH, 0], [PC_RIGHT, HALF_DEPTH, 150]]
  const p = block({ id: "pc", name: "Data system computer", corners, explosion: [0, 0, 0], radius: 4 })
  frontRect(p, FACE, [PC_LEFT + 10, 112], [PC_RIGHT - 10, 122])
  G.circle(p, [(PC_LEFT + PC_RIGHT) / 2, FACE, 136], 4, [0, -1, 0], { role: "detail" })
  return p
}

/** One module of the liquid chromatograph. Level 0 sits at the bottom. */
function stackModule(spec: StackSpec): Part {
  const z = spec.level * LC_LEVEL
  const corners: [Vec3, Vec3] = [[LC_LEFT, -HALF_DEPTH, z], [LC_RIGHT, HALF_DEPTH, z + LC_LEVEL]]
  const p = block({ id: spec.id, name: spec.name, corners, explosion: [0, 0, spec.level * 26], radius: 4 })
  frontRect(p, FACE, [LC_LEFT + 12, z + 10], [LC_RIGHT - 40, z + LC_LEVEL - 10])
  return p
}

function liquidChromatograph(): Part[] {
  return [
    stackModule({ id: "oven", name: "Column oven", level: 0 }),
    stackModule({ id: "sampler", name: "Autosampler", level: 1 }),
    stackModule({ id: "pump", name: "Binary pump", level: 2 }),
  ]
}

function spectrometer(): Part {
  const p = block({ id: "ms", name: "Mass spectrometer", corners: [[MS_LEFT, -HALF_DEPTH, 0], [MS_RIGHT, HALF_DEPTH, MS_TOP]], explosion: [0, 0, 0], radius: 8 })
  frontRect(p, FACE, [MS_LEFT + 40, 24], [MS_RIGHT - 16, 80])
  return p
}

/** The ion source on the left face, where the liquid enters the mass spectrometer. */
function source(): Part {
  const corners: [Vec3, Vec3] = [[MS_LEFT - 16, -30, 40], [MS_LEFT, 30, 90]]
  return block({ id: "source", name: "Ion source", corners, explosion: [0, -70, 0], radius: 3 })
}

/** Three quadrupoles in a row along X: two mass filters with a collision cell between them. */
function quadrupoles(): Part {
  const p = G.part("quads", "Quadrupoles")
  for (const x of [MS_LEFT + 24, MS_LEFT + 70, MS_LEFT + 116]) G.lathe(p, [[0, 0], [0, 10], [38, 10], [38, 0]], { axis: "x", at: [x, 0, 60], creaseAngle: 20 })
  p.explosion = [0, 0, 150]
  return p
}

function vacuumPump(): Part {
  const profile: [number, number][] = [[0, 0], [0, 26], [50, 26], [50, 0]]
  return turned({ id: "vacuum", name: "Vacuum pump", profile, at: [MS_RIGHT - 40, 30, MS_TOP], explosion: [90, 0, 20] })
}

function build(labels: Labels): Part[] {
  const tap = portAndTap(labels, { faceX: PC_LEFT, y: 0, z: 70 })
  return [computer(), ...liquidChromatograph(), spectrometer(), source(), quadrupoles(), vacuumPump(), ...tap]
}

export const lcMs: DrawingModel = { camera: DEFAULT_CAMERA, build }

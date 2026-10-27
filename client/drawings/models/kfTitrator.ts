/** Drawing model of the Karl Fischer titrator: a stirrer base with a display, the titration vessel, head and electrode, and the dosing unit and burette. */
import { G, type Part, type Vec3 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const HALF_WIDTH = 95
const HALF_DEPTH = 80
const BASE_TOP = 50
const VESSEL: Vec3 = [-25, 10, BASE_TOP]
const VESSEL_NECK = 100
const HEAD_Z = BASE_TOP + VESSEL_NECK
const DOSER: Vec3 = [72, 20, BASE_TOP]
const DOSER_TOP = BASE_TOP + 70
const FRONT = -HALF_DEPTH - 14.05

function base(): Part {
  const p = block({ id: "base", name: "Stirrer base", corners: [[-HALF_WIDTH, -HALF_DEPTH, 0], [HALF_WIDTH, HALF_DEPTH, BASE_TOP]], explosion: [0, 0, 0], radius: 10 })
  G.circle(p, [VESSEL[0], VESSEL[1], BASE_TOP + 0.05], 44, [0, 0, 1], { role: "detail" })
  return p
}

function display(): Part {
  const corners: [Vec3, Vec3] = [[-80, -HALF_DEPTH - 14, 8], [80, -HALF_DEPTH - 2, 42]]
  const p = block({ id: "display", name: "Display and keys", corners, explosion: [0, -80, 0], radius: 4 })
  frontRect(p, FRONT, [-70, 18], [10, 36])
  for (const x of [26, 44, 62]) frontRect(p, FRONT, [x - 6, 14], [x + 6, 24])
  return p
}

/** The glass cell: a wide body that narrows to a neck. It is open at the top. */
function vessel(): Part {
  const profile: [number, number][] = [[0, 0], [0, 36], [60, 36], [76, 18], [VESSEL_NECK, 18]]
  const p = turned({ id: "vessel", name: "Titration vessel", profile, at: VESSEL, explosion: [0, 0, 20] })
  p.transparent = true
  return p
}

function head(): Part {
  const profile: [number, number][] = [[0, 0], [0, 24], [8, 24], [8, 0]]
  return turned({ id: "head", name: "Titration head", profile, at: [VESSEL[0], VESSEL[1], HEAD_Z], explosion: [0, 0, 130] })
}

function electrode(): Part {
  const profile: [number, number][] = [[0, 0], [0, 3], [100, 3], [100, 0]]
  return turned({ id: "electrode", name: "Platinum electrode", profile, at: [VESSEL[0], VESSEL[1], BASE_TOP + 10], explosion: [0, 0, 115] })
}

function doser(): Part {
  const corners: [Vec3, Vec3] = [[DOSER[0] - 22, DOSER[1] - 30, BASE_TOP], [DOSER[0] + 22, DOSER[1] + 30, DOSER_TOP]]
  const p = block({ id: "doser", name: "Dosing unit", corners, explosion: [70, 0, 0], radius: 4 })
  G.circle(p, [DOSER[0], DOSER[1], DOSER_TOP + 0.05], 10, [0, 0, 1], { role: "detail" })
  return p
}

function burette(): Part {
  const profile: [number, number][] = [[0, 0], [0, 10], [130, 10], [130, 0]]
  const p = turned({ id: "burette", name: "Burette", profile, at: [DOSER[0], DOSER[1], DOSER_TOP], explosion: [70, 0, 70] })
  p.transparent = true
  return p
}

function feet(): Part {
  const p = G.part("feet", "Leveling feet")
  for (const x of [-70, 70]) G.lathe(p, [[0, 0], [0, 9], [10, 9], [10, 0]], { axis: "z", at: [x, -50, -11], creaseAngle: 20 })
  p.explosion = [0, 0, -55]
  return p
}

function build(labels: Labels): Part[] {
  const tap = portAndTap(labels, { faceX: -HALF_WIDTH, y: 0, z: 24 })
  return [feet(), base(), display(), vessel(), electrode(), head(), doser(), burette(), ...tap]
}

export const kfTitrator: DrawingModel = { camera: DEFAULT_CAMERA, build }

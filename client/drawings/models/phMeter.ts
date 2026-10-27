/** Drawing model of the pH meter: a base with a display, an electrode stand and arm, the electrode and a beaker. */
import { G, type Part, type Vec3 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const HALF_WIDTH = 90
const HALF_DEPTH = 70
const BASE_TOP = 44
const ROD: Vec3 = [62, 40, BASE_TOP]
const ROD_HEIGHT = 190
const ARM_Z = BASE_TOP + ROD_HEIGHT - 20
const PROBE: Vec3 = [-30, 40, 0]
const PROBE_LENGTH = 128
const FRONT = -HALF_DEPTH - 14.05

function base(): Part {
  const p = block({ id: "base", name: "Base housing", corners: [[-HALF_WIDTH, -HALF_DEPTH, 0], [HALF_WIDTH, HALF_DEPTH, BASE_TOP]], explosion: [0, 0, 0], radius: 8 })
  G.circle(p, [PROBE[0], PROBE[1], BASE_TOP + 0.05], 36, [0, 0, 1], { role: "detail" })
  return p
}

function display(): Part {
  const corners: [Vec3, Vec3] = [[-76, -HALF_DEPTH - 14, 8], [76, -HALF_DEPTH - 2, 38]]
  const p = block({ id: "display", name: "Display and keys", corners, explosion: [0, -80, 0], radius: 4 })
  frontRect(p, FRONT, [-66, 18], [14, 32])
  for (const x of [26, 44, 62]) frontRect(p, FRONT, [x - 6, 14], [x + 6, 24])
  return p
}

function stand(): Part {
  const profile: [number, number][] = [[0, 0], [0, 8], [ROD_HEIGHT, 8], [ROD_HEIGHT, 0]]
  return turned({ id: "stand", name: "Electrode stand", profile, at: ROD, explosion: [60, 0, 0] })
}

function arm(): Part {
  const p = block({ id: "arm", name: "Electrode arm", corners: [[-52, 32, ARM_Z], [ROD[0] + 8, 48, ARM_Z + 14]], explosion: [0, 0, 130], radius: 3 })
  G.circle(p, [PROBE[0], PROBE[1], ARM_Z + 14.05], 7, [0, 0, 1], { role: "detail" })
  return p
}

/** A glass bulb at the tip, a long body above it and a cap at the top. */
function electrode(): Part {
  const profile: [number, number][] = [[0, 0], [0, 2], [3, 5], [8, 7], [16, 7], [20, 6], [PROBE_LENGTH, 6], [PROBE_LENGTH, 0]]
  const z = ARM_Z - PROBE_LENGTH
  return turned({ id: "electrode", name: "pH electrode", profile, at: [PROBE[0], PROBE[1], z], explosion: [0, 0, 76] })
}

function beaker(): Part {
  const profile: [number, number][] = [[0, 0], [0, 30], [64, 34]]
  const p = turned({ id: "beaker", name: "Sample beaker", profile, at: [PROBE[0], PROBE[1], BASE_TOP], explosion: [0, 0, 36] })
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
  const tap = portAndTap(labels, { faceX: -HALF_WIDTH, y: 10, z: 22 })
  return [feet(), base(), display(), stand(), arm(), electrode(), beaker(), ...tap]
}

export const phMeter: DrawingModel = { camera: DEFAULT_CAMERA, build }

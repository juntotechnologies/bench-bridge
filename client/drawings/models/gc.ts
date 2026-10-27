/** Drawing model of the gas chromatograph: an oven cabinet with a door and control panel, the column, a top cover with the injector and detector, and a gas module. */
import { G, type Part, type Vec3 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const HALF_WIDTH = 125
const HALF_DEPTH = 105
const CABINET_TOP = 150
const COVER_TOP = CABINET_TOP + 14
const FRONT = -HALF_DEPTH - 7.05

function cabinet(): Part {
  return block({ id: "cabinet", name: "Oven cabinet", corners: [[-HALF_WIDTH, -HALF_DEPTH, 0], [HALF_WIDTH, HALF_DEPTH, CABINET_TOP]], explosion: [0, 0, 0], radius: 8 })
}

function door(): Part {
  const corners: [Vec3, Vec3] = [[-100, -HALF_DEPTH - 7, 16], [100, -HALF_DEPTH, 112]]
  const p = block({ id: "door", name: "Oven door", corners, explosion: [0, -90, 0], radius: 3 })
  frontRect(p, FRONT, [-80, 34], [80, 94])
  return p
}

function panel(): Part {
  const corners: [Vec3, Vec3] = [[-100, -HALF_DEPTH - 7, 118], [100, -HALF_DEPTH, 146]]
  const p = block({ id: "panel", name: "Control panel", corners, explosion: [0, -90, 100], radius: 3 })
  frontRect(p, FRONT, [-90, 124], [-20, 140])
  for (const x of [0, 26, 52, 78]) frontRect(p, FRONT, [x - 8, 126], [x + 8, 138])
  return p
}

/** The capillary column wound in a drum, seen as a short drum with winding rings. */
function column(): Part {
  const profile: [number, number][] = [[0, 0], [0, 66], [60, 66], [60, 0]]
  const p = turned({ id: "column", name: "Column coil", profile, at: [0, 0, 40], explosion: [0, 0, 115] })
  for (const z of [52, 68, 84]) G.circle(p, [0, 0, z], 66.05, [0, 0, 1], { role: "detail" })
  return p
}

function cover(): Part {
  const p = block({ id: "cover", name: "Top cover", corners: [[-HALF_WIDTH, -HALF_DEPTH, CABINET_TOP], [HALF_WIDTH, HALF_DEPTH, COVER_TOP]], explosion: [0, 0, 220], radius: 6 })
  for (const x of [-70, 70]) G.circle(p, [x, 0, COVER_TOP + 0.05], 26, [0, 0, 1], { role: "detail" })
  return p
}

function injector(): Part {
  const profile: [number, number][] = [[0, 0], [0, 16], [40, 16], [48, 10], [58, 10], [58, 0]]
  return turned({ id: "injector", name: "Injector", profile, at: [-70, 0, COVER_TOP], explosion: [0, 0, 300] })
}

function detector(): Part {
  const profile: [number, number][] = [[0, 0], [0, 22], [46, 22], [46, 0]]
  return turned({ id: "detector", name: "Flame detector", profile, at: [70, 0, COVER_TOP], explosion: [0, 0, 300] })
}

function gasModule(): Part {
  const p = block({ id: "gas", name: "Gas module", corners: [[-HALF_WIDTH - 34, -90, 20], [-HALF_WIDTH, -30, 100]], explosion: [-60, -30, 0], radius: 4 })
  for (const y of [-75, -60, -45]) G.circle(p, [-HALF_WIDTH - 34.05, y, 60], 5, [-1, 0, 0], { role: "detail" })
  return p
}

function feet(): Part {
  const p = G.part("feet", "Leveling feet")
  for (const x of [-95, 95]) G.lathe(p, [[0, 0], [0, 9], [10, 9], [10, 0]], { axis: "z", at: [x, -70, -11], creaseAngle: 20 })
  p.explosion = [0, 0, -55]
  return p
}

function build(labels: Labels): Part[] {
  const tap = portAndTap(labels, { faceX: -HALF_WIDTH, y: 40, z: 40 })
  return [feet(), cabinet(), door(), panel(), column(), cover(), injector(), detector(), gasModule(), ...tap]
}

export const gc: DrawingModel = { camera: DEFAULT_CAMERA, build }

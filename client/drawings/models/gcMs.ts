/** Drawing model of the GC-MS: a gas chromatograph with its cover and injector, a transfer line, and a mass spectrometer with its mass filter and pump. */
import { G, type Part, type Vec3 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const GC_LEFT = -150
const GC_RIGHT = -20
const GC_TOP = 130
const GC_COVER_TOP = GC_TOP + 12
const MS_LEFT = 20
const MS_RIGHT = 150
const MS_TOP = 100
const HALF_DEPTH = 80
const FRONT = -HALF_DEPTH - 6.05

function oven(): Part {
  const p = block({ id: "oven", name: "GC oven", corners: [[GC_LEFT, -HALF_DEPTH, 0], [GC_RIGHT, HALF_DEPTH, GC_TOP]], explosion: [0, 0, 0], radius: 8 })
  frontRect(p, -HALF_DEPTH - 0.05, [GC_LEFT + 20, 16], [GC_RIGHT - 20, 84])
  return p
}

function cover(): Part {
  const corners: [Vec3, Vec3] = [[GC_LEFT, -HALF_DEPTH, GC_TOP], [GC_RIGHT, HALF_DEPTH, GC_COVER_TOP]]
  return block({ id: "cover", name: "GC cover", corners, explosion: [0, 0, 110], radius: 5 })
}

function injector(): Part {
  const profile: [number, number][] = [[0, 0], [0, 16], [40, 16], [48, 10], [58, 10], [58, 0]]
  return turned({ id: "injector", name: "Injector", profile, at: [GC_LEFT + 45, 0, GC_COVER_TOP], explosion: [0, 0, 190] })
}

function keypad(): Part {
  const corners: [Vec3, Vec3] = [[GC_LEFT + 14, -HALF_DEPTH - 6, 96], [GC_RIGHT - 14, -HALF_DEPTH, 124]]
  const p = block({ id: "keypad", name: "Keypad and display", corners, explosion: [0, -90, 0], radius: 2.5 })
  frontRect(p, FRONT, [GC_LEFT + 22, 102], [GC_LEFT + 70, 118])
  for (const x of [GC_LEFT + 84, GC_LEFT + 104]) frontRect(p, FRONT, [x - 7, 104], [x + 7, 116])
  return p
}

/** A heated tube that joins the oven to the mass spectrometer, lying along X. */
function transferLine(): Part {
  const p = G.part("transfer", "Transfer line")
  G.lathe(p, [[0, 0], [0, 6], [GC_RIGHT * -1 + MS_LEFT, 6], [GC_RIGHT * -1 + MS_LEFT, 0]], { axis: "x", at: [GC_RIGHT, 0, 60], creaseAngle: 20 })
  p.explosion = [0, 0, 70]
  return p
}

function spectrometer(): Part {
  const p = block({ id: "ms", name: "Mass spectrometer", corners: [[MS_LEFT, -HALF_DEPTH, 0], [MS_RIGHT, HALF_DEPTH, MS_TOP]], explosion: [0, 0, 0], radius: 8 })
  frontRect(p, -HALF_DEPTH - 0.05, [MS_LEFT + 16, 20], [MS_RIGHT - 16, 70])
  return p
}

/** The quadrupole rods: a long cylinder along X, seated inside the housing. */
function massFilter(): Part {
  const p = G.part("filter", "Mass filter")
  G.lathe(p, [[0, 0], [0, 12], [90, 12], [90, 0]], { axis: "x", at: [MS_LEFT + 20, -20, 50], creaseAngle: 20 })
  p.explosion = [0, 0, 150]
  return p
}

function pump(): Part {
  const profile: [number, number][] = [[0, 0], [0, 28], [56, 28], [56, 0]]
  return turned({ id: "pump", name: "Vacuum pump", profile, at: [MS_RIGHT - 40, 30, MS_TOP], explosion: [100, 0, 20] })
}

function feet(): Part {
  const p = G.part("feet", "Leveling feet")
  for (const x of [-130, -40, 50, 130]) G.lathe(p, [[0, 0], [0, 9], [10, 9], [10, 0]], { axis: "z", at: [x, -60, -11], creaseAngle: 20 })
  p.explosion = [0, 0, -55]
  return p
}

function build(labels: Labels): Part[] {
  const tap = portAndTap(labels, { faceX: GC_LEFT, y: 0, z: 60 })
  return [feet(), oven(), cover(), injector(), keypad(), transferLine(), spectrometer(), massFilter(), pump(), ...tap]
}

export const gcMs: DrawingModel = { camera: DEFAULT_CAMERA, build }

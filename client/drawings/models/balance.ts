/** Drawing model of the analytical balance: its parts, explosion paths and camera. */
import { G, type Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

function housing(): Part {
  const p = block({ id: "housing", name: "Base housing", corners: [[-100, -150, 0], [100, 160, 78]], explosion: [0, 0, 0], radius: 10 })
  G.circle(p, [0, 20, 78.05], 56, [0, 0, 1], { role: "detail" })
  return p
}

function display(): Part {
  const p = block({ id: "display", name: "Display and keys", corners: [[-82, -166, 18], [82, -152, 66]], explosion: [0, -80, 0], radius: 4 })
  frontRect(p, -166.05, [-70, 40], [10, 58])
  frontRect(p, -166.05, [24, 30], [40, 40])
  frontRect(p, -166.05, [50, 30], [66, 40])
  return p
}

function pan(): Part {
  const profile: [number, number][] = [[0, 0], [0, 46], [2.5, 46], [2.5, 0]]
  return turned({ id: "pan", name: "Weighing pan", profile, at: [0, 20, 92], explosion: [0, 0, 90] })
}

function spider(): Part {
  const profile: [number, number][] = [[0, 0], [0, 9], [12, 9], [12, 0]]
  return turned({ id: "spider", name: "Pan support", profile, at: [0, 20, 79], explosion: [0, 0, 45] })
}

function shield(): Part {
  const p = block({ id: "shield", name: "Draft shield glass", corners: [[-86, -96, 82], [86, 146, 220]], explosion: [0, 0, 150], radius: 4 })
  p.transparent = true
  return p
}

function shieldFrame(): Part {
  const p = block({ id: "frame", name: "Shield top frame", corners: [[-90, -100, 221], [90, 150, 230]], explosion: [0, 0, 240], radius: 6 })
  G.box(p, [-6, -110, 200], [6, -100, 221])
  return p
}

function feet(): Part {
  const p = G.part("feet", "Leveling feet")
  for (const x of [-80, 80]) G.lathe(p, [[0, 0], [0, 9], [10, 9], [10, 0]], { axis: "z", at: [x, -125, -11], creaseAngle: 20 })
  p.explosion = [0, 0, -55]
  return p
}

function build(labels: Labels): Part[] {
  return [feet(), housing(), display(), spider(), pan(), shield(), shieldFrame(), ...portAndTap(labels, { faceX: -100, y: 60, z: 40 })]
}

export const balance: DrawingModel = { camera: DEFAULT_CAMERA, build }

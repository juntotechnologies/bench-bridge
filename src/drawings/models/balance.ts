import { G, type Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

function housing(): Part {
  const p = block("housing", "Base housing", [[-100, -150, 0], [100, 160, 78]], [0, 0, 0], 10)
  G.circle(p, [0, 20, 78.05], 56, [0, 0, 1], { role: "detail" })
  return p
}

function display(): Part {
  const p = block("display", "Display and keys", [[-82, -166, 18], [82, -152, 66]], [0, -80, 0], 4)
  frontRect(p, -166.05, [-70, 40], [10, 58])
  frontRect(p, -166.05, [24, 30], [40, 40])
  frontRect(p, -166.05, [50, 30], [66, 40])
  return p
}

function pan(): Part {
  return turned("pan", "Weighing pan", [[0, 0], [0, 46], [2.5, 46], [2.5, 0]], [0, 20, 92], [0, 0, 90])
}

function spider(): Part {
  return turned("spider", "Pan support", [[0, 0], [0, 9], [12, 9], [12, 0]], [0, 20, 79], [0, 0, 45])
}

function shield(): Part {
  const p = block("shield", "Draft shield glass", [[-86, -96, 82], [86, 146, 220]], [0, 0, 150], 4)
  p.transparent = true
  return p
}

function shieldFrame(): Part {
  const p = block("frame", "Shield top frame", [[-90, -100, 221], [90, 150, 230]], [0, 0, 240], 6)
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

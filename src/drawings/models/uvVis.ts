import { G, type Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

function chassis(): Part {
  return block("chassis", "Base chassis", [[-220, -150, 0], [220, 150, 40]], [0, 0, 0], 6)
}

function cover(): Part {
  const p = block("cover", "Top cover", [[-220, -150, 41], [220, 150, 150]], [0, 0, 170], 10)
  frontRect(p, -150.05, [80, 80], [190, 125])
  for (const x of [80, 110, 140, 170]) frontRect(p, -150.05, [x, 55], [x + 20, 68])
  return p
}

function lamp(): Part {
  const p = block("lamp", "Deuterium lamp house", [[110, -40, 41], [190, 60, 115]], [0, 0, 60], 4)
  G.circle(p, [110 - 0.05, 10, 80], 18, [-1, 0, 0], { role: "detail" })
  return p
}

function monochromator(): Part {
  return block("mono", "Monochromator", [[-30, -60, 41], [90, 80, 105]], [0, 0, 30], 4)
}

function cellHolder(): Part {
  return block("cell", "Cell holder", [[-120, -30, 41], [-60, 30, 95]], [0, 0, 20], 3)
}

function cuvette(): Part {
  const p = block("cuvette", "Quartz cuvette", [[-96, -6, 70], [-84, 6, 118]], [0, 0, 330])
  p.transparent = true
  return p
}

function build(labels: Labels): Part[] {
  const parts = [chassis(), cellHolder(), monochromator(), lamp(), cuvette(), cover()]
  return [...parts, ...portAndTap(labels, { faceX: -220, y: 60, z: 20 })]
}

export const uvVis: DrawingModel = { camera: DEFAULT_CAMERA, build }

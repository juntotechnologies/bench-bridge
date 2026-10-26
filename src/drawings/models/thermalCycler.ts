import { G, type Part, type Vec2 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, disc, frontRect, spread, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const PITCH = 12

function base(): Part {
  const p = block("base", "Base housing", [[-130, -170, 0], [130, 170, 110]], [0, 0, 0], 8)
  for (const z of spread(5, 20, 12)) frontRect(p, -170.05, [-110, z], [-30, z + 5])
  return p
}

function panel(): Part {
  const p = block("panel", "Control panel", [[0, -182, 20], [115, -171, 95]], [0, -70, 0], 4)
  frontRect(p, -182.05, [12, 55], [103, 85])
  for (const x of spread(4, 12, 24)) frontRect(p, -182.05, [x, 30], [x + 18, 44])
  return p
}

function block48(): Part {
  const p = G.part("block", "48-well sample block")
  const holes = spread(8, -42, PITCH).flatMap(wellColumn)
  const shape = G.extrude(G.piece(), G.roundedRectangle(110, 82, 4), { depth: 22, holes })
  G.merge(p, G.transform(shape, { origin: [0, 10, 111] }))
  p.explosion = [0, 0, 70]
  return p
}

function wellColumn(x: number): Vec2[][] {
  return spread(6, -30, PITCH).map(wellAt.bind(null, x))
}

function wellAt(x: number, y: number): Vec2[] {
  return disc([x, y], 3.6, 20)
}

function lid(): Part {
  return block("lid", "Heated lid", [[-115, -120, 136], [115, 150, 172]], [0, 0, 170], 10)
}

function knob(): Part {
  return turned("knob", "Lid pressure knob", [[0, 0], [0, 24], [14, 24], [16, 20], [16, 0]], [0, 15, 172], [0, 0, 230])
}

function build(labels: Labels): Part[] {
  return [base(), panel(), block48(), lid(), knob(), ...portAndTap(labels, { faceX: -130, y: 70, z: 50 })]
}

export const thermalCycler: DrawingModel = { camera: DEFAULT_CAMERA, build }

import { G, type Part, type Vec2 } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, disc, frontRect, spread, turned } from "../shapes"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const PITCH = 9

function housing(): Part {
  const p = block("housing", "Reader housing", [[-150, -170, 0], [150, 170, 104]], [0, 0, 0], 8)
  frontRect(p, -170.05, [-75, 25], [75, 45])
  frontRect(p, -170.05, [90, 60], [135, 85])
  return p
}

function cover(): Part {
  return block("cover", "Top cover", [[-150, -170, 105], [150, 170, 132]], [0, 0, 300], 8)
}

function optics(): Part {
  return block("optics", "Optics head", [[-60, -20, 70], [60, 60, 100]], [0, 0, 120])
}

function filterWheel(): Part {
  return turned("filters", "Filter wheel", [[0, 0], [0, 42], [5, 42], [5, 0]], [0, 110, 92], [0, 0, 190])
}

function carrier(): Part {
  return block("carrier", "Plate carrier", [[-72, -230, 28], [72, -130, 36]], [0, -120, 0], 3)
}

function plate(): Part {
  const p = G.part("plate", "96-well plate")
  const holes = spread(12, -49.5, PITCH).flatMap(wellColumn)
  const shape = G.extrude(G.piece(), G.roundedRectangle(127, 85, 3), { depth: 14, holes })
  G.merge(p, G.transform(shape, { origin: [0, -180, 37] }))
  p.explosion = [0, -120, 70]
  return p
}

function wellColumn(x: number): Vec2[][] {
  return spread(8, -31.5, PITCH).map(wellAt.bind(null, x))
}

function wellAt(x: number, y: number): Vec2[] {
  return disc([x, y], 3.3, 20)
}

function build(labels: Labels): Part[] {
  const inside = [optics(), filterWheel(), carrier(), plate()]
  return [housing(), ...inside, cover(), ...portAndTap(labels, { faceX: -150, y: 80, z: 40 })]
}

export const plateReader: DrawingModel = { camera: DEFAULT_CAMERA, build }

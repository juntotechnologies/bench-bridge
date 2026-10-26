import { G, type Part, type Vec3 } from "../engine"
import { sideProfile } from "../shapes"

/** A wedge console: low at the front (−Y), high at the back, with a display window and keys on the slope. */
export interface Console {
  x: [number, number]
  y: [number, number]
  z: [number, number]
}

export function slopedConsole(id: string, name: string, shape: Console): Part {
  const [y0, y1] = shape.y
  const [front, back] = shape.z
  const p = G.part(id, name)
  sideProfile(p, [[y0, 0], [y1, 0], [y1, back], [y0, front]], shape.x[0], shape.x[1] - shape.x[0])
  slopeRect(p, shape, [0.08, 0.55], [0.2, 0.85])
  for (const u of [0.62, 0.74, 0.86]) slopeRect(p, shape, [u, u + 0.08], [0.25, 0.45])
  return p
}

/** A rectangle on the sloped face, given as fractions across X and up the slope. */
function slopeRect(p: Part, shape: Console, [u0, u1]: [number, number], [v0, v1]: [number, number]): void {
  const corners: Vec3[] = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(onSlope.bind(null, shape)) as Vec3[]
  G.polyline(p, corners, { closed: true, role: "detail" })
}

function onSlope(shape: Console, [u, v]: number[]): Vec3 {
  const x = shape.x[0] + (u as number) * (shape.x[1] - shape.x[0])
  const y = shape.y[0] + (v as number) * (shape.y[1] - shape.y[0])
  const z = shape.z[0] + (v as number) * (shape.z[1] - shape.z[0]) + 0.08
  return [x, y, z]
}

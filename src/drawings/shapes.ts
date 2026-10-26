import { G, type Part, type Vec2, type Vec3 } from "./engine"

export const BRIDGE_ID = "bridge"

/** Points on a circle, for extrude holes and outlines. */
export function disc(center: Vec2, radius: number, segments = 48): Vec2[] {
  return Array.from({ length: segments }, discPoint.bind(null, center, radius, segments))
}

function discPoint(center: Vec2, radius: number, segments: number, _: unknown, i: number): Vec2 {
  const angle = (i * 2 * Math.PI) / segments
  return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]
}

/** A part built from one block, given its world explosion. */
export function block(id: string, name: string, corners: [Vec3, Vec3], explosion: Vec3, radius = 0): Part {
  const p = G.part(id, name)
  G.box(p, corners[0], corners[1], { radius })
  p.explosion = explosion
  return p
}

/** A turned part on a vertical axis through a base point. */
export function turned(id: string, name: string, profile: Vec2[], at: Vec3, explosion: Vec3): Part {
  const p = G.part(id, name)
  G.lathe(p, profile, { axis: "z", at, creaseAngle: 20 })
  p.explosion = explosion
  return p
}

/** A side profile in the YZ plane, extruded along +X from a start X. */
export function sideProfile(p: Part, profile: Vec2[], fromX: number, depth: number): Part {
  const shape = G.extrude(G.piece(), profile, { depth })
  return G.merge(p, G.transform(shape, { ...G.plane("yz"), origin: [fromX, 0, 0] }))
}

/** A rectangle drawn on a face that looks toward −Y, such as a display window. */
export function frontRect(p: Part, y: number, [x0, z0]: Vec2, [x1, z1]: Vec2): Part {
  const corners: Vec3[] = [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]
  return G.polyline(p, corners, { closed: true, role: "detail" })
}

/** A row of evenly spaced items, for vents, keys and wells. */
export function spread(count: number, from: number, pitch: number): number[] {
  return Array.from({ length: count }, step.bind(null, from, pitch))
}

function step(from: number, pitch: number, _: unknown, i: number): number {
  return from + i * pitch
}

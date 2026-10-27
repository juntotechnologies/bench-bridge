/** Small part builders shared by every drawing model. */
import { G, type Part, type Vec2, type Vec3 } from "./engine"

interface Disc {
  center: Vec2
  radius: number
  segments: number
}

/** Points on a circle, for extrude holes and outlines. */
export function disc(center: Vec2, radius: number, segments = 48): Vec2[] {
  return Array.from({ length: segments }, discPoint.bind(null, { center, radius, segments }))
}

function discPoint(shape: Disc, _: unknown, i: number): Vec2 {
  const angle = (i * 2 * Math.PI) / shape.segments
  return [shape.center[0] + shape.radius * Math.cos(angle), shape.center[1] + shape.radius * Math.sin(angle)]
}

interface PartSpec {
  id: string
  name: string
  explosion: Vec3
}

export interface BlockSpec extends PartSpec {
  corners: [Vec3, Vec3]
  radius?: number
}

export interface TurnedSpec extends PartSpec {
  profile: Vec2[]
  at: Vec3
}

/** A part built from one block, given its world explosion. */
export function block(spec: BlockSpec): Part {
  const p = G.part(spec.id, spec.name)
  G.box(p, spec.corners[0], spec.corners[1], { radius: spec.radius ?? 0 })
  p.explosion = spec.explosion
  return p
}

/** A turned part on a vertical axis through a base point. */
export function turned(spec: TurnedSpec): Part {
  const p = G.part(spec.id, spec.name)
  G.lathe(p, spec.profile, { axis: "z", at: spec.at, creaseAngle: 20 })
  p.explosion = spec.explosion
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

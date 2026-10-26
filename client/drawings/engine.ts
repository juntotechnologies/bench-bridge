/** Typed bridge to the vendored teardown geometry and projection engine. */
import "../../.agents/skills/teardown/assets/geometry.js"
import "../../.agents/skills/teardown/assets/sheet.js"
import "../../.agents/skills/teardown/assets/projection.js"

export type Vec3 = [number, number, number]
export type Vec2 = [number, number]
export type Role = "outline" | "edge" | "detail" | "texture" | "axis"

export interface Part {
  id: string
  name: string
  explosion: Vec3
  transparent?: boolean
}

export interface Frame {
  origin?: Vec3
  xAxis?: Vec3
  yAxis?: Vec3
  zAxis?: Vec3
}

export interface Camera {
  azimuth: number
  elevation: number
  roll: number
}

export interface RenderOptions {
  explosion: number
  fitExplosion?: number
  isolated?: string | null
  fill?: boolean
  annotate?: boolean
  camera: Camera
}

export interface RenderResult {
  markup: string
  scale: number
  offset: Vec2
}

interface Geometry {
  part(id: string, name: string, explosion?: Vec3): Part
  box(p: Part, min: Vec3, max: Vec3, options?: { radius?: number; role?: Role }): Part
  lathe(p: Part, profile: Vec2[], options?: { axis?: "x" | "y" | "z"; at?: Vec3; creaseAngle?: number; segments?: number }): Part
  extrude(p: Part, profile: Vec2[], options: { depth: number; holes?: Vec2[][]; role?: Role }): Part
  transform(p: Part, frame: Frame): Part
  merge(target: Part, source: Part): Part
  piece(): Part
  along(axis: "x" | "y" | "z"): Frame
  plane(name: "xy" | "xz" | "yz"): Frame
  circle(p: Part, center: Vec3, radius: number, normal: Vec3, options?: { role?: Role; segments?: number }): Part
  line(p: Part, a: Vec3, b: Vec3, role?: Role): Part
  polyline(p: Part, points: Vec3[], options?: { closed?: boolean; role?: Role }): Part
  sweep(p: Part, path: Vec3[], section: Vec2[], options?: { role?: Role }): Part
  roundedRectangle(width: number, height: number, radius: number, options?: { center?: Vec2 }): Vec2[]
}

interface Projection {
  render(parts: Part[], options: RenderOptions): RenderResult
}

const engine = globalThis as unknown as { TechnicalGeometry: Geometry; TechnicalProjection: Projection }

export const G = engine.TechnicalGeometry
export const P = engine.TechnicalProjection

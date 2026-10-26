import { G, type Part, type Vec3 } from "../engine"
import { block, BRIDGE_ID, frontRect, turned } from "../shapes"
import type { Labels } from "../bridgeKit"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

const RING = 74
const CORD_Z = 30

function body(): Part {
  const p = block("body", "Centrifuge body", [[-150, -170, 0], [150, 170, 180]], [0, 0, 0], 26)
  frontRect(p, -170.05, [-90, 70], [90, 130])
  G.circle(p, [0, 10, 180.05], 128, [0, 0, 1], { role: "detail" })
  return p
}

function lid(): Part {
  const profile: [number, number][] = [[0, 0], [0, 124], [10, 122], [24, 100], [30, 40], [32, 0]]
  return turned("lid", "Lid", profile, [0, 10, 181], [0, 0, 260])
}

function rotor(): Part {
  const profile: [number, number][] = [[0, 0], [0, 96], [26, 96], [36, 30], [50, 14], [50, 0]]
  return turned("rotor", "Swing rotor", profile, [0, 10, 96], [0, 0, 150])
}

function tubes(): Part {
  const p = G.part("tubes", "Sample tubes")
  for (let i = 0; i < 12; i++) G.lathe(p, tubeProfile(), { axis: "z", at: tubeBase(i), creaseAngle: 20 })
  p.explosion = [0, 0, 210]
  return p
}

function tubeProfile(): [number, number][] {
  return [[0, 0], [0, 3], [8, 7.5], [70, 7.5], [70, 9], [76, 9], [76, 0]]
}

function tubeBase(i: number): Vec3 {
  const a = (i * Math.PI) / 6
  return [RING * Math.cos(a), 10 + RING * Math.sin(a), 104]
}

function mains(): Part {
  const p = G.part("mains", "Mains lead")
  const section: [number, number][] = Array.from({ length: 16 }, cordPoint)
  G.sweep(p, [[-150, -60, CORD_Z], [-260, -60, CORD_Z], [-300, -90, CORD_Z]], section)
  return p
}

function cordPoint(_: unknown, i: number): [number, number] {
  return [4 * Math.cos((i * Math.PI) / 8), 4 * Math.sin((i * Math.PI) / 8)]
}

function clamp(): Part {
  const p = G.part("clamp", "Current clamp")
  G.lathe(p, [[0, 6], [0, 16], [26, 16], [26, 6]], { at: [-232, -60, CORD_Z], creaseAngle: 20 })
  p.explosion = [0, 0, 60]
  return p
}

function reed(): Part {
  return block("reed", "Lid reed switch", [[-40, -162, 181], [-10, -150, 189]], [0, -40, 40], 2)
}

function tap(kit: string): Part {
  return block(BRIDGE_ID, kit, [[-290, 20, 0], [-244, 50, 16]], [-60, 0, 0], 4)
}

function build(labels: Labels): Part[] {
  return [body(), rotor(), tubes(), lid(), reed(), mains(), clamp(), tap(labels.kit)]
}

export const centrifuge: DrawingModel = { camera: DEFAULT_CAMERA, build }

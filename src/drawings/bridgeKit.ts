import { G, type Part, type Vec3 } from "./engine"
import { BRIDGE_ID, disc } from "./shapes"

export interface Labels {
  kit: string
  connector: string
}

/** Where the instrument's connector sits: on a face that looks toward −X. */
export interface PortAnchor {
  faceX: number
  y: number
  z: number
}

const BODY: Vec3 = [46, 30, 16]
const PROUD = 3
const PLUG = 4
const TRAVEL = 70

/** The instrument's connector and the tap plugged into it, exploding apart along −X. */
export function portAndTap(labels: Labels, anchor: PortAnchor): Part[] {
  return [port(labels.connector, anchor), tap(labels.kit, anchor)]
}

function port(name: string, anchor: PortAnchor): Part {
  const p = G.part("port", name)
  const shell = G.extrude(G.piece(), trapezoid(1.4), { depth: PROUD, holes: [trapezoid(1)] })
  G.transform(shell, { ...G.plane("yz"), origin: [anchor.faceX - PROUD, anchor.y, anchor.z] })
  G.merge(p, shell)
  p.explosion = [-TRAVEL / 3, 0, 0]
  return p
}

function tap(kit: string, anchor: PortAnchor): Part {
  const p = G.part(BRIDGE_ID, kit)
  const x1 = anchor.faceX - PROUD - PLUG
  const [w, d, h] = BODY
  G.box(p, [x1 - w, anchor.y - d / 2, anchor.z - h / 2], [x1, anchor.y + d / 2, anchor.z + h / 2], { radius: 4 })
  G.circle(p, [x1 - w * 0.7, anchor.y - d / 2 - 0.05, anchor.z], 1.6, [0, -1, 0], { role: "detail", segments: 48 })
  const plug = G.extrude(G.piece(), trapezoid(0.95), { depth: PLUG, holes: [disc([0, 0], 1.1, 24)] })
  G.merge(p, G.transform(plug, { ...G.plane("yz"), origin: [x1, anchor.y, anchor.z] }))
  G.lathe(p, [[0, 0], [0, 2], [22, 1.4], [24, 0]], { axis: "z", at: [x1 - w + 8, anchor.y + d / 4, anchor.z + h / 2 - 0.5], creaseAngle: 20 })
  p.explosion = [-TRAVEL, 0, 0]
  return p
}

function trapezoid(scale: number): [number, number][] {
  return [[-8 * scale, -3.5 * scale], [8 * scale, -3.5 * scale], [6.5 * scale, 3.5 * scale], [-6.5 * scale, 3.5 * scale]]
}

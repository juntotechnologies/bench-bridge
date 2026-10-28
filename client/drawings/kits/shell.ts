/** The case, the lid with its tamper seal, the two pass-through connectors, the share connector and the network jack. */
import { G, type Part, type Vec2, type Vec3 } from "../engine"
import { block, frontRect } from "../shapes"
import { FLOOR, HALF_DEPTH, HALF_WIDTH, LID_TOP, LIFT, PORT_HEIGHT, PROUD } from "./layout"
import { UPLINK } from "./outlines"
import type { Connector, PartContext } from "./types"

const POSTS: Vec2[] = [[-70, -40], [70, -40], [-70, 40], [70, 40]]
const VENTS = [-30, -15, 0, 15, 30]

export function caseFloor(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[-HALF_WIDTH, -HALF_DEPTH, 0], [HALF_WIDTH, HALF_DEPTH, FLOOR]]
  const p = block({ id: "case", name: context.name, corners, explosion: [0, 0, 0], radius: 4 })
  for (const [x, y] of POSTS) G.circle(p, [x, y, FLOOR + 0.05], 3, [0, 0, 1], { role: "detail" })
  return p
}

export function lid(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[-HALF_WIDTH, -HALF_DEPTH, FLOOR], [HALF_WIDTH, HALF_DEPTH, LID_TOP]]
  const p = block({ id: "lid", name: context.name, corners, explosion: [0, 0, LIFT.lid], radius: 6 })
  frontRect(p, -HALF_DEPTH - 0.05, [-14, FLOOR - 4], [14, FLOOR + 6])
  for (const x of VENTS) G.line(p, [x, 20, LID_TOP + 0.05], [x, 38, LID_TOP + 0.05], "detail")
  return p
}

/** A connector plate on a side face, extruded outward along X from a start X. */
function sidePlate(p: Part, connector: Connector, fromX: number): Part {
  const plate = G.extrude(G.piece(), connector.shell, { depth: PROUD, holes: [connector.hole] })
  return G.merge(p, G.transform(plate, { ...G.plane("yz"), origin: [fromX, 0, PORT_HEIGHT] }))
}

/** A connector plate on the instrument side, the left face. */
function leftPlate(id: string, context: PartContext): Part {
  const p = sidePlate(G.part(id, context.name), context.connector, -HALF_WIDTH - PROUD)
  p.explosion = [-LIFT.port, 0, 0]
  return p
}

export function portIn(context: PartContext): Part {
  return leftPlate("port-in", context)
}

/** The network jack that joins the instrument network, where the export share lives. */
export function portShare(context: PartContext): Part {
  return leftPlate("port-share", context)
}

export function portOut(context: PartContext): Part {
  const p = sidePlate(G.part("port-out", context.name), context.connector, HALF_WIDTH)
  p.explosion = [LIFT.port, 0, 0]
  return p
}

/** The network jack on the front face, extruded outward along −Y. */
export function uplink(context: PartContext): Part {
  const p = G.part("uplink", context.name)
  const jack = G.extrude(G.piece(), UPLINK.shell, { depth: PROUD, holes: [UPLINK.hole] })
  G.merge(p, G.transform(jack, { ...G.plane("xz"), origin: [-30, -HALF_DEPTH, PORT_HEIGHT] }))
  p.explosion = [0, -LIFT.uplink, 0]
  return p
}

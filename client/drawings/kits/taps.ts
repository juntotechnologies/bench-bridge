/** The tap board of each kit: the part that copies the signal and has no way to write back. */
import { G, type Part, type Vec3 } from "../engine"
import { block } from "../shapes"
import { LIFT } from "./layout"
import type { PartContext } from "./types"

const BOARD_Z = 12

function board(id: string, name: string): Part {
  const corners: [Vec3, Vec3] = [[-62, -34, BOARD_Z], [62, 34, BOARD_Z + 3]]
  return block({ id, name, corners, explosion: [0, 0, LIFT.tap], radius: 2 })
}

/** Three straight traces. The send trace has a branch to a small receiver chip. */
export function tapSerial(context: PartContext): Part {
  const p = board("tap-serial", context.name)
  const z = BOARD_Z + 3.05
  for (const y of [-14, 0, 14]) G.line(p, [-62, y, z], [62, y, z], "detail")
  G.line(p, [-10, 0, z], [-10, 22, z], "detail")
  G.box(p, [-22, 22, BOARD_Z + 3], [2, 32, BOARD_Z + 8])
  return p
}

/** Two transformer blocks, and two receive-only monitor jacks on the front edge. */
export function tapNetwork(context: PartContext): Part {
  const p = board("tap-network", context.name)
  for (const x of [-30, 14]) G.box(p, [x, -8, BOARD_Z + 3], [x + 22, 8, BOARD_Z + 11])
  for (const x of [-34, 12]) G.box(p, [x, -48, BOARD_Z], [x + 22, -34, BOARD_Z + 12])
  return p
}

/** A gateway module and two rows of bus pins. */
export function tapGpib(context: PartContext): Part {
  const p = board("tap-gpib", context.name)
  G.box(p, [-24, -16, BOARD_Z + 3], [24, 16, BOARD_Z + 12])
  for (const y of [-26, 26]) G.box(p, [-48, y - 2, BOARD_Z + 3], [48, y + 2, BOARD_Z + 8])
  return p
}

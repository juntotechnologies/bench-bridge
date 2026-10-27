/** The boards inside the case: the capture computer, its card and clock, the isolation module and the power module. */
import { G, type Part, type Vec3 } from "../engine"
import { block } from "../shapes"
import { LIFT } from "./layout"
import type { PartContext } from "./types"

const COMPUTER_Z = 36

export function computer(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[-38, -26, COMPUTER_Z], [38, 26, COMPUTER_Z + 4]]
  const p = block({ id: "computer", name: context.name, corners, explosion: [0, 0, LIFT.computer], radius: 2 })
  G.box(p, [-14, -10, COMPUTER_Z + 4], [10, 14, COMPUTER_Z + 9])
  G.box(p, [-34, -22, COMPUTER_Z + 4], [-24, -12, COMPUTER_Z + 7])
  return p
}

/** The memory card, seated near the edge of the computer board. */
export function storage(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[18, -22, COMPUTER_Z + 4], [34, 4, COMPUTER_Z + 6]]
  return block({ id: "storage", name: context.name, corners, explosion: [32, -46, LIFT.storage], radius: 1.5 })
}

/** The clock chip and its coin cell. */
export function clock(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[-34, 8, COMPUTER_Z + 4], [-20, 20, COMPUTER_Z + 8]]
  const p = block({ id: "clock", name: context.name, corners, explosion: [-44, 34, LIFT.clock] })
  G.lathe(p, [[0, 0], [0, 3.5], [7, 3.5], [7, 0]], { axis: "z", at: [-6, 14, COMPUTER_Z + 4], creaseAngle: 20 })
  return p
}

export function isolator(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[-26, -16, 20], [26, 16, 30]]
  const p = block({ id: "isolator", name: context.name, corners, explosion: [0, 0, LIFT.isolator], radius: 2 })
  for (const x of [-18, -6, 6, 18]) G.line(p, [x, -16.05, 22], [x, -16.05, 28], "detail")
  return p
}

export function power(context: PartContext): Part {
  const corners: [Vec3, Vec3] = [[38, 14, 14], [68, 42, 34]]
  return block({ id: "power", name: context.name, corners, explosion: [30, 46, LIFT.power], radius: 2 })
}

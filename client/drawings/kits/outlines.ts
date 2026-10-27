/** Connector outlines seen from the front. Each is a shell and an opening, in drawing units. */
import type { Vec2 } from "../engine"
import type { Connector } from "./types"

const SHELL_SCALE = 1.9
const HOLE_SCALE = 1.25

const DB9: Vec2[] = [[-8, -3.5], [8, -3.5], [6.5, 3.5], [-6.5, 3.5]]
const RJ45: Vec2[] = [[-6, -4], [6, -4], [6, 2], [3, 2], [3, 4], [-3, 4], [-3, 2], [-6, 2]]
const GPIB: Vec2[] = [[-11, -3], [11, -3], [12.5, 0], [11, 3], [-11, 3], [-12.5, 0]]

function scaled(shape: Vec2[], factor: number): Vec2[] {
  return shape.map(scalePoint.bind(null, factor))
}

function scalePoint(factor: number, [u, v]: Vec2): Vec2 {
  return [u * factor, v * factor]
}

function connector(shape: Vec2[]): Connector {
  return { shell: scaled(shape, SHELL_SCALE), hole: scaled(shape, HOLE_SCALE) }
}

/** The connector of each kit, by kit ID. */
export const CONNECTORS: Record<string, Connector> = {
  "serial-tap": connector(DB9),
  "network-tap": connector(RJ45),
  "gpib-tap": connector(GPIB),
}

/** The network jack on the front of every kit. */
export const UPLINK: Connector = connector(RJ45)

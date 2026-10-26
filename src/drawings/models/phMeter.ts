import type { Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, turned } from "../shapes"
import { slopedConsole } from "./slopedConsole"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

function meter(): Part {
  return slopedConsole("meter", "Meter console", { x: [-110, 110], y: [-90, 90], z: [32, 72] })
}

function standBase(): Part {
  return block("stand", "Stand base", [[140, -70, 0], [270, 70, 12]], [0, 0, 0], 8)
}

function post(): Part {
  return turned("post", "Support rod", [[0, 0], [0, 6], [260, 6], [260, 0]], [245, 30, 12], [0, 0, 0])
}

function arm(): Part {
  return block("arm", "Electrode arm", [[160, 20, 214], [252, 40, 228]], [0, 0, 70], 4)
}

function electrode(): Part {
  const profile: [number, number][] = [[0, 0], [0, 3], [6, 6], [130, 6], [130, 8], [160, 8], [160, 0]]
  return turned("electrode", "pH electrode", profile, [178, 30, 70], [0, 0, 150])
}

function beaker(): Part {
  const p = turned("beaker", "Sample beaker", [[0, 0], [0, 38], [95, 38], [95, 36], [2, 36], [2, 0]], [178, 30, 12], [0, -40, 0])
  p.transparent = true
  return p
}

function build(labels: Labels): Part[] {
  return [meter(), standBase(), post(), beaker(), arm(), electrode(), ...portAndTap(labels, { faceX: -110, y: 10, z: 16 })]
}

export const phMeter: DrawingModel = { camera: DEFAULT_CAMERA, build }

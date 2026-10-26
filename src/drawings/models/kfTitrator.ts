import type { Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, turned } from "../shapes"
import { slopedConsole } from "./slopedConsole"
import { DEFAULT_CAMERA, type DrawingModel } from "./types"

function control(): Part {
  return slopedConsole("control", "Control unit", { x: [-120, 120], y: [-100, 100], z: [36, 80] })
}

function tower(): Part {
  return block("tower", "Burette drive", [[150, -10, 0], [230, 90, 300]], [0, 0, 0], 8)
}

function burette(): Part {
  const p = turned("burette", "Glass burette", [[0, 0], [0, 11], [150, 11], [150, 0]], [190, 40, 300], [0, 0, 130])
  p.transparent = true
  return p
}

function stirrer(): Part {
  return block("stirrer", "Magnetic stirrer", [[260, -110, 0], [380, 10, 40]], [0, 0, 0], 8)
}

function vessel(): Part {
  const profile: [number, number][] = [[0, 0], [0, 40], [90, 40], [90, 30], [110, 30], [110, 0]]
  const p = turned("vessel", "Titration vessel", profile, [320, -50, 41], [0, 0, 120])
  p.transparent = true
  return p
}

function sensor(): Part {
  return turned("sensor", "Double Pt electrode", [[0, 0], [0, 5], [150, 5], [150, 9], [180, 9], [180, 0]], [335, -50, 80], [0, 0, 260])
}

function bottle(): Part {
  const profile: [number, number][] = [[0, 0], [0, 48], [150, 48], [175, 18], [195, 18], [195, 0]]
  return turned("bottle", "KF reagent bottle", profile, [320, 110, 0], [260, -30, 0])
}

function build(labels: Labels): Part[] {
  const parts = [control(), tower(), burette(), stirrer(), bottle(), vessel(), sensor()]
  return [...parts, ...portAndTap(labels, { faceX: -120, y: 0, z: 18 })]
}

export const kfTitrator: DrawingModel = { camera: DEFAULT_CAMERA, build }

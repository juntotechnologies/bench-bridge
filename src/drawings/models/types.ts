import type { Camera, Part } from "../engine"
import type { Labels } from "../bridgeKit"

export interface DrawingModel {
  camera: Camera
  build: (labels: Labels) => Part[]
}

export const DEFAULT_CAMERA: Camera = { azimuth: -128, elevation: 24, roll: 0 }

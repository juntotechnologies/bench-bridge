/** The shapes a kit drawing model uses: part names from the registry, and the connector outline of the kit. */
import type { Camera, Part, Vec2 } from "../engine"

/** Part name by part ID. The registry owns the names, and the drawing builds the parts that it lists. */
export type PartNames = Record<string, string>

/** A connector seen from the front: the shell outline and the opening inside it. */
export interface Connector {
  shell: Vec2[]
  hole: Vec2[]
}

export interface KitModel {
  camera: Camera
  build: (names: PartNames) => Part[]
}

/** What a part builder needs: the part name and the kit's connector. */
export interface PartContext {
  name: string
  connector: Connector
}

export type PartBuilder = (context: PartContext) => Part

export const KIT_CAMERA: Camera = { azimuth: -128, elevation: 26, roll: 0 }

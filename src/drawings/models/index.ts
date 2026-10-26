import type { DrawingModel } from "./types"
import { balance } from "./balance"

/** Keyed by device ID in data/devices.json; a test fails when the two drift. */
export const MODELS: Record<string, DrawingModel> = { balance }

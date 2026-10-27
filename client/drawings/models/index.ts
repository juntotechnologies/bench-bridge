/** Registry of drawing models, keyed by device ID. */
import type { DrawingModel } from "./types"
import { balance } from "./balance"
import { hplc } from "./hplc"
import { phMeter } from "./phMeter"

/** Keyed by device ID in shared/data/devices.json; `npm run proof` fails when a device has no model. */
export const MODELS: Record<string, DrawingModel> = { balance, hplc, "ph-meter": phMeter }

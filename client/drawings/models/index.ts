/** Registry of drawing models, keyed by device ID. */
import type { DrawingModel } from "./types"
import { balance } from "./balance"
import { gc } from "./gc"
import { gcMs } from "./gcMs"
import { hplc } from "./hplc"
import { kfTitrator } from "./kfTitrator"
import { phMeter } from "./phMeter"

/** Keyed by device ID in shared/data/devices.json; `npm run proof` fails when a device has no model. */
export const MODELS: Record<string, DrawingModel> = { balance, hplc, gc, "gc-ms": gcMs, "ph-meter": phMeter, "kf-titrator": kfTitrator }

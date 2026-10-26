import type { DrawingModel } from "./types"
import { balance } from "./balance"
import { centrifuge } from "./centrifuge"
import { freezer } from "./freezer"
import { kfTitrator } from "./kfTitrator"
import { phMeter } from "./phMeter"
import { plateReader } from "./plateReader"
import { thermalCycler } from "./thermalCycler"
import { uvVis } from "./uvVis"

/** Keyed by device ID in data/devices.json; a test fails when the two drift. */
export const MODELS: Record<string, DrawingModel> = {
  balance,
  "ph-meter": phMeter,
  "uv-vis": uvVis,
  "plate-reader": plateReader,
  "thermal-cycler": thermalCycler,
  centrifuge,
  freezer,
  "kf-titrator": kfTitrator,
}

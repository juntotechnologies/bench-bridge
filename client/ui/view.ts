/** Which drawing the stage shows, and what a click on a drawing item changes. The Kit tab shows the bridge kit. Every other tab shows the instrument. */
import { deviceById } from "@shared/registry"
import { BRIDGE_ID, kitDrawingId } from "../drawings/ids"
import type { AppState, TabId } from "./store"

export type ViewPatch = Partial<Pick<AppState, "tab" | "part">>

export function drawingId(deviceId: string, tab: TabId): string {
  const kit = deviceById(deviceId)?.kit
  return tab === "kit" && kit ? kitDrawingId(kit) : deviceId
}

/** A pick toggles: the same part again clears the pick. */
export function pickedPart(current: string | null, picked: string): string | null {
  return current === picked ? null : picked
}

/** The change a click on a drawing item makes: a pick on the kit view, an open on the bridge tap, nothing elsewhere. */
export function itemPatch(state: Pick<AppState, "tab" | "part">, item: string): ViewPatch | null {
  if (state.tab === "kit") return { part: pickedPart(state.part, item) }
  return item === BRIDGE_ID ? { tab: "kit", part: null } : null
}

/** The tab that the stage switch button opens: the kit from the instrument view, the instrument from the kit view. */
export function switchedTab(tab: TabId): TabId {
  return tab === "kit" ? "overview" : "kit"
}

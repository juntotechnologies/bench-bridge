import { catalog, copy, isLive } from "../registry"
import type { CatalogEntry } from "../registry/schema"
import type { DrawingClient } from "../drawings/client"
import { h } from "./dom"
import type { AppState, Store } from "./store"

export function deviceList(store: Store, drawings: DrawingClient): HTMLElement {
  const cards = catalog.map(card.bind(null, store, drawings))
  const panel = h("aside", { class: "panel devices" }, [h("div", { class: "panel-title" }, [copy.panels.devices]), ...cards])
  store.subscribe(markActive.bind(null, panel))
  markActive(panel, store.get())
  return panel
}

function card(store: Store, drawings: DrawingClient, entry: CatalogEntry, index: number): HTMLElement {
  const live = isLive(entry)
  const thumb = h("div", { class: "thumb" }, [h("span", {}, [String(index + 1).padStart(2, "0")])])
  if (live) void drawings.draw(entry.id, 0, false).then(fillThumb.bind(null, thumb))
  const props = { class: live ? "device" : "device is-planned", attrs: { "data-device": entry.id, disabled: !live, title: entry.why }, on: { click: select.bind(null, store, entry.id) } }
  return h("button", props, [
    thumb,
    h("div", { class: "device-text" }, [h("div", { class: "device-name" }, [entry.name]), h("div", { class: "device-meta" }, [`${entry.era} · ${entry.interface}`])]),
    h("span", { class: live ? "status" : "status is-planned" }, [live ? copy.status.bridged : copy.status.planned]),
  ])
}

function fillThumb(thumb: HTMLElement, markup: string): void {
  thumb.innerHTML = `<svg viewBox="40 20 340 257">${markup}</svg>`
}

function select(store: Store, deviceId: string): void {
  if (store.get().deviceId !== deviceId) store.set({ deviceId, run: null, revealed: 0 })
}

function markActive(panel: HTMLElement, state: AppState): void {
  for (const el of panel.querySelectorAll<HTMLElement>("[data-device]")) el.classList.toggle("is-active", el.dataset["device"] === state.deviceId)
}

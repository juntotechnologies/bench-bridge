/** The instrument catalogue panel: live devices are selectable, planned ones are dimmed. */
import { catalog, copy, isLive } from "@shared/registry"
import type { CatalogEntry } from "@shared/registry/schema"
import type { DrawingClient } from "../drawings/client"
import { h } from "./dom"
import { filterCounts, matchesFilter } from "./catalogFilter"
import { IDLE_RUN, type AppState, type CatalogFilter, type Store } from "./store"

type FilterEntry = (typeof copy.filters)[number]

export function deviceList(store: Store, drawings: DrawingClient): HTMLElement {
  const cards = catalog.map(card.bind(null, store, drawings))
  const title = h("div", { class: "panel-title" }, [copy.panels.devices])
  const panel = h("aside", { class: "panel devices", attrs: { "data-glow": true } }, [title, filterBar(store), ...cards])
  store.subscribe(markActive.bind(null, panel))
  markActive(panel, store.get())
  return panel
}

function filterBar(store: Store): HTMLElement {
  const counts = filterCounts(catalog)
  return h("div", { class: "filters", attrs: { role: "group", "aria-label": copy.panels.devices } }, copy.filters.map(filterChip.bind(null, store, counts)))
}

function filterChip(store: Store, counts: Record<CatalogFilter, number>, entry: FilterEntry): HTMLElement {
  const id = entry.id as CatalogFilter
  const props = { class: "filter", attrs: { "data-filter": id }, on: { click: setFilter.bind(null, store, id) } }
  return h("button", props, [entry.label, h("b", {}, [String(counts[id])])])
}

function setFilter(store: Store, catalogFilter: CatalogFilter): void {
  store.set({ catalogFilter })
}

function card(store: Store, drawings: DrawingClient, entry: CatalogEntry, index: number): HTMLElement {
  const live = isLive(entry)
  const thumb = h("div", { class: "thumb" }, [h("span", {}, [String(index + 1).padStart(2, "0")])])
  if (live) void drawings.draw(entry.id, 0, false).then(fillThumb.bind(null, thumb))
  const props = { class: live ? "device" : "device is-planned", attrs: { "data-device": entry.id, "data-live": String(live), disabled: !live, title: entry.why }, on: { click: select.bind(null, store, entry.id) } }
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
  if (store.get().deviceId !== deviceId) store.set({ deviceId, pane: "stage", part: null, ...IDLE_RUN })
}

function markActive(panel: HTMLElement, state: AppState): void {
  for (const el of panel.querySelectorAll<HTMLElement>("[data-device]")) markCard(el, state)
  for (const el of panel.querySelectorAll<HTMLElement>("[data-filter]")) markChip(el, state.catalogFilter)
}

function markCard(el: HTMLElement, state: AppState): void {
  el.classList.toggle("is-active", el.dataset["device"] === state.deviceId)
  el.hidden = !matchesFilter(state.catalogFilter, el.dataset["live"] === "true")
}

function markChip(el: HTMLElement, selected: CatalogFilter): void {
  const on = el.dataset["filter"] === selected
  el.classList.toggle("is-on", on)
  el.setAttribute("aria-pressed", String(on))
}

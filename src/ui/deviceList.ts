import { copy, devices } from "../registry"
import type { Device } from "../registry/schema"
import type { DrawingClient } from "../drawings/client"
import { logEvent } from "../log"
import { h, svg } from "./dom"
import { icon } from "./icons"
import type { AppState, Store } from "./store"

const DOMAINS = ["chemistry", "biology"] as const
const DOMAIN_ICONS = { chemistry: "flask", biology: "dna" }

export function deviceList(store: Store, drawings: DrawingClient): HTMLElement {
  const groups = DOMAINS.map(domainGroup.bind(null, store, drawings))
  const panel = h("aside", { class: "panel devices" }, [h("div", { class: "panel-title" }, [copy.panels.devices]), ...groups])
  store.subscribe(markActive.bind(null, panel))
  markActive(panel, store.get())
  return panel
}

function domainGroup(store: Store, drawings: DrawingClient, domain: (typeof DOMAINS)[number]): HTMLElement {
  const cards = devices.filter(inDomain.bind(null, domain)).map(deviceCard.bind(null, store, drawings))
  const label = h("div", { class: "group-label" }, [svg(icon(DOMAIN_ICONS[domain], 13)), copy.domains[domain]])
  return h("section", { class: "group" }, [label, ...cards])
}

function deviceCard(store: Store, drawings: DrawingClient, device: Device): HTMLElement {
  const thumb = h("div", { class: "thumb" })
  void drawings.draw(device.id, 0, false).then(fillThumb.bind(null, thumb), thumbFailed.bind(null, device.id))
  return h("button", { class: "device", attrs: { "data-device": device.id }, on: { click: select.bind(null, store, device.id) } }, [
    thumb,
    h("div", { class: "device-text" }, [
      h("div", { class: "device-name" }, [device.name]),
      h("div", { class: "device-meta" }, [`${device.model} · ${device.era} · ${device.port.kind}`]),
    ]),
    h("span", { class: `status status-${device.status}` }, [copy.status[device.status]]),
  ])
}

function fillThumb(thumb: HTMLElement, markup: string): void {
  thumb.innerHTML = `<svg viewBox="40 20 340 257">${markup}</svg>`
}

function thumbFailed(deviceId: string, error: Error): void {
  logEvent("drawing.thumb_failed", { deviceId, message: error.message }, "error")
}

function select(store: Store, deviceId: string): void {
  if (store.get().deviceId !== deviceId) store.set({ deviceId, run: null, revealed: 0 })
}

function markActive(panel: HTMLElement, state: AppState): void {
  for (const card of panel.querySelectorAll<HTMLElement>("[data-device]")) {
    card.classList.toggle("is-active", card.dataset["device"] === state.deviceId)
  }
}

function inDomain(domain: string, device: Device): boolean {
  return device.domain === domain
}

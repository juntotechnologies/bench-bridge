/** The Port tab: connector diagram, line settings and pin table. */
import { copy } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg, type Child } from "../dom"
import { pairList } from "./pairs"

const SETTING_SEPARATOR = " · "

type Diagram = (used: Set<string>) => string

const DIAGRAMS: Record<string, Diagram> = { "RS-232": db9, LAN: rj45 }

/** The connector drawing for a port kind, with the used pins filled. */
export function portDiagram(kind: string, used: Set<string>): string | undefined {
  return DIAGRAMS[kind]?.(used)
}

/** The parts of a settings line, split at each middle dot. */
export function settingParts(settings: string): string[] {
  return settings.split(SETTING_SEPARATOR)
}

function settingChip(part: string): HTMLElement {
  return h("code", { class: "tool-chip" }, [part])
}

export function portTab(device: Device): Child[] {
  const used = new Set(device.port.pins.map(pinNumber))
  const diagram = portDiagram(device.port.kind, used)
  return [
    h("h2", { class: "inspector-title" }, [device.port.kind, h("small", {}, [device.port.connector])]),
    diagram ? svg(diagram, "port-diagram") : null,
    h("div", { class: "eyebrow" }, [copy.port.connection]),
    pairList(device.connection),
    settingsBlock(device),
    h("div", { class: "eyebrow" }, [copy.port.pins]),
    pinTable(device),
  ]
}

function settingsBlock(device: Device): HTMLElement {
  const chips = settingParts(device.port.settings).map(settingChip)
  return h("div", { class: "setting" }, [h("div", { class: "eyebrow" }, [copy.port.settings]), h("div", { class: "tool-chips" }, chips)])
}

function pinTable(device: Device): HTMLElement {
  const head = h("tr", {}, [h("th", {}, [copy.port.pin]), h("th", {}, [copy.port.signal]), h("th", {}, [copy.port.use])])
  return h("table", { class: "pins" }, [h("thead", {}, [head]), h("tbody", {}, device.port.pins.map(pinRow))])
}

function pinNumber(pin: [string, string, string]): string {
  return pin[0]
}

function pinRow([pin, signal, use]: [string, string, string]): HTMLElement {
  return h("tr", {}, [h("td", {}, [h("b", {}, [pin])]), h("td", {}, [h("code", {}, [signal])]), h("td", {}, [use])])
}

/** A DB9 face seen from the front: pins 1–5 on top, 6–9 below. Used pins are filled. */
function db9(used: Set<string>): string {
  const pins = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(db9Pin.bind(null, used)).join("")
  return `<svg viewBox="0 0 220 110"><path d="M20 20h180l-18 70H38z" class="shell"/>${pins}</svg>`
}

/** An RJ45 jack seen from the front: eight contacts in a row. Used contacts are filled. */
function rj45(used: Set<string>): string {
  const contacts = [1, 2, 3, 4, 5, 6, 7, 8].map(rj45Contact.bind(null, used)).join("")
  return `<svg viewBox="0 0 220 110"><path d="M40 22h140v58h-24v14H64V80H40z" class="shell"/>${contacts}</svg>`
}

function rj45Contact(used: Set<string>, pin: number): string {
  const x = 50 + (pin - 1) * 15
  const on = used.has(String(pin)) ? " is-used" : ""
  return `<rect x="${x}" y="32" width="9" height="28" rx="2" class="pin${on}"/><text x="${x + 4.5}" y="74">${pin}</text>`
}

function db9Pin(used: Set<string>, pin: number): string {
  const top = pin <= 5
  const x = top ? 50 + (pin - 1) * 30 : 65 + (pin - 6) * 30
  const y = top ? 42 : 70
  const on = used.has(String(pin)) ? " is-used" : ""
  return `<circle cx="${x}" cy="${y}" r="7" class="pin${on}"/><text x="${x}" y="${y + (top ? -12 : 20)}">${pin}</text>`
}

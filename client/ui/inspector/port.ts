import { copy } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg, type Child } from "../dom"

type Diagram = (used: Set<string>) => string

const DIAGRAMS: Record<string, Diagram> = { "RS-232": db9 }

export function portTab(device: Device): Child[] {
  const used = new Set(device.port.pins.map(pinNumber))
  const diagram = DIAGRAMS[device.port.kind]
  return [
    h("h2", { class: "inspector-title" }, [device.port.kind, h("small", {}, [device.port.connector])]),
    diagram ? svg(diagram(used), "port-diagram") : null,
    h("div", { class: "setting" }, [h("div", { class: "eyebrow" }, [copy.port.settings]), h("code", {}, [device.port.settings])]),
    h("div", { class: "eyebrow" }, [copy.port.pins]),
    h("table", { class: "pins" }, [
      h("thead", {}, [h("tr", {}, [h("th", {}, [copy.port.pin]), h("th", {}, [copy.port.signal]), h("th", {}, [copy.port.use])])]),
      h("tbody", {}, device.port.pins.map(pinRow)),
    ]),
  ]
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

function db9Pin(used: Set<string>, pin: number): string {
  const top = pin <= 5
  const x = top ? 50 + (pin - 1) * 30 : 65 + (pin - 6) * 30
  const y = top ? 42 : 70
  const on = used.has(String(pin)) ? " is-used" : ""
  return `<circle cx="${x}" cy="${y}" r="7" class="pin${on}"/><text x="${x}" y="${y + (top ? -12 : 20)}">${pin}</text>`
}

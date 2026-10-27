/** The top bar: brand, link back to the Junto Technologies hub, bridged count and the clock. */
import { copy, devices } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg } from "./dom"
import { icon } from "./icons"

export function header(clock: HTMLElement, toggle: HTMLElement): HTMLElement {
  return h("header", { class: "topbar" }, [brand(), h("div", { class: "topbar-end" }, [hubLink(), fleetCard(clock), toggle])])
}

/** The attributes of the link back to the hub. It opens in the same tab, so it sets no target. */
export function hubAttrs(hub: typeof copy.hub): Record<string, string> {
  return { href: hub.href, "aria-label": `${hub.back} ${hub.label}` }
}

function hubLink(): HTMLElement {
  const text = h("span", { class: "hub-link-text" }, [copy.hub.label])
  return h("a", { class: "hub-link", attrs: hubAttrs(copy.hub) }, [svg(icon("back"), "hub-link-icon"), text])
}

function brand(): HTMLElement {
  const tagline = h("div", { class: "brand-tagline" }, copy.tagline.flatMap(withSeparator))
  return h("div", { class: "brand" }, [
    svg(icon("bridge", 30), "brand-mark"),
    h("div", {}, [h("div", { class: "brand-name" }, [copy.product]), tagline]),
  ])
}

function withSeparator(word: string, index: number): (HTMLElement | string)[] {
  const item = h("span", {}, [word])
  return index === 0 ? [item] : [h("i", {}, ["·"]), item]
}

function fleetCard(clock: HTMLElement): HTMLElement {
  const bridged = devices.filter(isBridged).length
  const meter = h("div", { class: "meter" }, [h("span", { attrs: { style: `width:${(bridged / devices.length) * 100}%` } })])
  return h("div", { class: "fleet" }, [
    h("div", { class: "fleet-count" }, [
      svg(icon("tag"), "fleet-icon"),
      h("div", {}, [h("div", { class: "eyebrow" }, [copy.fleetLabel]), meter]),
      h("b", {}, [`${bridged}/${devices.length}`]),
    ]),
    clock,
  ])
}

function isBridged(device: Device): boolean {
  return device.status === "bridged"
}

/** Date and time in the sheet style: "OCT 26, 2026" over "15:04:11". */
export function clockText(date: Date): [string, string] {
  const day = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()
  return [day, date.toLocaleTimeString("en-GB", { hour12: false })]
}

import { copy, devices } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg } from "./dom"
import { icon } from "./icons"

export function header(clock: HTMLElement): HTMLElement {
  return h("header", { class: "topbar" }, [brand(), fleetCard(clock)])
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

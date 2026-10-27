/** The Overview tab: before and after, the bridge kit and the specs. */
import { copy, kitTitle } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg, type Child } from "../dom"
import { icon } from "../icons"
import type { AppState, Store } from "../store"
import { pairList } from "./pairs"

export function overviewTab(device: Device, _state: AppState, store: Store): Child[] {
  return [
    h("h2", { class: "inspector-title" }, [device.name]),
    h("p", { class: "lede" }, [device.summary]),
    h("div", { class: "compare" }, [
      column(copy.overview.problemTitle, device.today, "cross", "is-before"),
      column(copy.overview.bridgeTitle, device.bridged, "check", "is-after"),
    ]),
    kitCard(device, store),
    pairList(device.specs),
  ]
}

function kitCard(device: Device, store: Store): HTMLElement {
  const open = h("button", { class: "kit-open", on: { click: openKit.bind(null, store) } }, [copy.overview.openKit])
  const text = h("div", { class: "kit-text" }, [h("div", { class: "eyebrow" }, [copy.overview.kitTitle]), kitTitle(device)])
  return h("div", { class: "kit" }, [svg(icon("bridge", 18)), text, open])
}

function openKit(store: Store): void {
  store.set({ tab: "kit", part: null })
}

function column(title: string, items: string[], mark: string, tone: string): HTMLElement {
  return h("div", { class: `compare-col ${tone}` }, [
    h("div", { class: "eyebrow" }, [title]),
    h("ul", {}, items.map(listItem.bind(null, mark))),
  ])
}

function listItem(mark: string, text: string): HTMLElement {
  return h("li", {}, [svg(icon(mark, 14), "mark"), text])
}

/** The Overview tab: before and after, the bridge kit and the specs. */
import { copy } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, svg, type Child } from "../dom"
import { icon } from "../icons"

export function overviewTab(device: Device): Child[] {
  return [
    h("h2", { class: "inspector-title" }, [device.name]),
    h("p", { class: "lede" }, [device.summary]),
    h("div", { class: "compare" }, [
      column(copy.overview.problemTitle, device.today, "cross", "is-before"),
      column(copy.overview.bridgeTitle, device.bridged, "check", "is-after"),
    ]),
    h("div", { class: "kit" }, [svg(icon("bridge", 18)), h("div", {}, [h("div", { class: "eyebrow" }, [copy.overview.kitTitle]), device.kit])]),
    h("dl", { class: "specs" }, device.specs.flatMap(specRow)),
  ]
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

function specRow([label, value]: [string, string]): HTMLElement[] {
  return [h("dt", {}, [label]), h("dd", {}, [value])]
}

/** The Kit tab: how the data moves, the parts, the install steps, the checks and the safeguards of the bridge kit. */
import { copy, kitById, kitChecks, kitSafeguards, partsOf } from "@shared/registry"
import type { Device, Kit, KitExample, KitPart, KitStep } from "@shared/registry/schema"
import { h, type Child } from "../dom"
import type { AppState, Store } from "../store"
import { itemPatch } from "../view"

export function kitTab(device: Device, state: AppState, store: Store): Child[] {
  const kit = kitById(device.kit) as Kit
  return [
    h("h2", { class: "inspector-title" }, [kit.name, h("small", {}, [`${copy.kit.fits} ${device.name}`])]),
    h("p", { class: "lede" }, [kit.summary]),
    section(copy.kit.flow, steps(kit.flow, "ol")),
    section(copy.kit.parts, partList(store, state, partsOf(kit))),
    section(copy.kit.install, steps(kit.install, "ol")),
    section(copy.kit.checks, steps(kitChecks, "ul")),
    section(copy.kit.safeguards, steps(kitSafeguards, "ul")),
  ]
}

function section(title: string, body: HTMLElement): HTMLElement {
  return h("section", { class: "kit-section" }, [h("div", { class: "eyebrow" }, [title]), body])
}

function steps(items: KitStep[], tag: "ol" | "ul"): HTMLElement {
  return h(tag, { class: "steps" }, items.map(step))
}

function step(item: KitStep): HTMLElement {
  return h("li", {}, [h("b", {}, [item.title]), h("span", {}, [item.detail])])
}

function partList(store: Store, state: AppState, parts: KitPart[]): HTMLElement {
  const rows = parts.map(partRow.bind(null, store, state.part))
  return h("div", { class: "parts-list" }, [h("p", { class: "hint" }, [copy.kit.pickHint]), ...rows])
}

function partRow(store: Store, picked: string | null, part: KitPart): HTMLElement {
  const on = part.id === picked
  const button = h("button", { class: "part-row", attrs: { "data-part": part.id, "aria-expanded": String(on) }, on: { click: pick.bind(null, store, part.id) } }, [part.name])
  return h("div", { class: on ? "part is-picked" : "part" }, [button, on ? partDetail(part) : null])
}

function pick(store: Store, id: string): void {
  const patch = itemPatch({ tab: "kit", part: store.get().part }, id)
  if (patch) store.set(patch)
}

function partDetail(part: KitPart): HTMLElement {
  return h("div", { class: "part-detail" }, [
    fact(copy.kit.job, part.job),
    fact(copy.kit.why, part.why),
    part.examples.length ? examples(part.examples) : null,
  ])
}

function fact(label: string, text: string): HTMLElement {
  return h("p", {}, [h("b", { class: "eyebrow" }, [label]), text])
}

function examples(items: KitExample[]): HTMLElement {
  return h("div", { class: "examples" }, [
    h("b", { class: "eyebrow" }, [copy.kit.examples]),
    h("ul", {}, items.map(example)),
    h("p", { class: "hint" }, [copy.kit.exampleNote]),
  ])
}

function example(item: KitExample): HTMLElement {
  return h("li", {}, [h("b", {}, [`${item.vendor} ${item.product}`]), h("span", {}, [item.note])])
}

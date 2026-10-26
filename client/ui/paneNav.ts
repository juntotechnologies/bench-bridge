/** The pane switch for narrow windows: one button per pane. CSS hides it when all panes fit. */
import { copy } from "@shared/registry"
import { h, svg } from "./dom"
import { icon } from "./icons"
import type { AppState, Pane, Store } from "./store"

type PaneEntry = (typeof copy.panes)[number]

export function paneNav(store: Store): HTMLElement {
  const nav = h("nav", { class: "pane-nav", attrs: { "aria-label": copy.paneNavLabel } }, copy.panes.map(paneButton.bind(null, store)))
  store.subscribe(markActive.bind(null, nav))
  markActive(nav, store.get())
  return nav
}

/** Mirrors the current pane onto the app root, so CSS can show the right pane. */
export function bindPane(root: HTMLElement, store: Store): void {
  store.subscribe(setPane.bind(null, root))
  setPane(root, store.get())
}

function paneButton(store: Store, entry: PaneEntry): HTMLElement {
  const click = showPane.bind(null, store, entry.id as Pane)
  return h("button", { attrs: { "data-pane": entry.id }, on: { click } }, [svg(icon(entry.icon, 18)), h("span", {}, [entry.label])])
}

function showPane(store: Store, pane: Pane): void {
  store.set({ pane })
}

function markActive(nav: HTMLElement, state: AppState): void {
  for (const button of nav.querySelectorAll<HTMLElement>("[data-pane]")) {
    const on = button.dataset["pane"] === state.pane
    button.classList.toggle("is-on", on)
    button.setAttribute("aria-pressed", String(on))
  }
}

function setPane(root: HTMLElement, state: AppState): void {
  root.dataset["pane"] = state.pane
}

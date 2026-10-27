/** The inspector panel: tab bar and the view for the selected tab. */
import { copy, deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, replace, type Child } from "../dom"
import type { AppState, Store, TabId } from "../store"
import { dataTab } from "./data"
import { deliverTab } from "./deliver"
import { kitTab } from "./kit"
import { overviewTab } from "./overview"
import { portTab } from "./port"

type TabView = (device: Device, state: AppState, store: Store) => Child[]

const TABS: Record<TabId, TabView> = { overview: overviewTab, port: portTab, kit: kitTab, data: dataTab, deliver: deliverTab }

/** The state that changes what the panel shows. Any other change leaves the panel alone, so the terminal animation does not restart. */
const VIEW_KEYS = ["deviceId", "tab", "run", "revealed", "delivery", "part"] as const

interface Panel {
  store: Store
  tabs: HTMLElement
  body: HTMLElement
}

export function inspector(store: Store): HTMLElement {
  const tabs = h("nav", { class: "tabs", attrs: { role: "tablist" } }, (Object.keys(TABS) as TabId[]).map(tabButton.bind(null, store)))
  const body = h("div", { class: "inspector-body", attrs: { role: "tabpanel" } })
  const panel: Panel = { store, tabs, body }
  store.subscribe(render.bind(null, panel))
  render(panel, store.get(), null)
  return h("aside", { class: "panel inspector" }, [tabs, body])
}

function tabButton(store: Store, tab: TabId): HTMLElement {
  return h("button", { attrs: { role: "tab", "data-tab": tab }, on: { click: selectTab.bind(null, store, tab) } }, [copy.panels.tabs[tab]])
}

function selectTab(store: Store, tab: TabId): void {
  store.set({ tab })
}

function render(panel: Panel, state: AppState, previous: AppState | null): void {
  if (previous && sameView(state, previous)) return
  for (const button of panel.tabs.querySelectorAll<HTMLElement>("[data-tab]")) {
    button.setAttribute("aria-selected", String(button.dataset["tab"] === state.tab))
  }
  const device = deviceById(state.deviceId) as Device
  replace(panel.body, ...TABS[state.tab](device, state, panel.store))
  panel.body.querySelector(".is-picked")?.scrollIntoView({ block: "nearest" })
}

function sameView(a: AppState, b: AppState): boolean {
  return VIEW_KEYS.every(sameKey.bind(null, a, b))
}

function sameKey(a: AppState, b: AppState, key: (typeof VIEW_KEYS)[number]): boolean {
  return a[key] === b[key]
}

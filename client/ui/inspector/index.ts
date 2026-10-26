import { copy, deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { h, replace, type Child } from "../dom"
import type { AppState, Store, TabId } from "../store"
import { dataTab } from "./data"
import { deliverTab } from "./deliver"
import { overviewTab } from "./overview"
import { portTab } from "./port"

type TabView = (device: Device, state: AppState) => Child[]

const TABS: Record<TabId, TabView> = { overview: overviewTab, port: portTab, data: dataTab, deliver: deliverTab }

export function inspector(store: Store): HTMLElement {
  const tabs = h("nav", { class: "tabs", attrs: { role: "tablist" } }, (Object.keys(TABS) as TabId[]).map(tabButton.bind(null, store)))
  const body = h("div", { class: "inspector-body", attrs: { role: "tabpanel" } })
  store.subscribe(render.bind(null, tabs, body))
  render(tabs, body, store.get(), null)
  return h("aside", { class: "panel inspector" }, [tabs, body])
}

function tabButton(store: Store, tab: TabId): HTMLElement {
  return h("button", { attrs: { role: "tab", "data-tab": tab }, on: { click: selectTab.bind(null, store, tab) } }, [copy.panels.tabs[tab]])
}

function selectTab(store: Store, tab: TabId): void {
  store.set({ tab })
}

function render(tabs: HTMLElement, body: HTMLElement, state: AppState, previous: AppState | null): void {
  if (previous && sameView(state, previous)) return
  for (const button of tabs.querySelectorAll<HTMLElement>("[data-tab]")) {
    button.setAttribute("aria-selected", String(button.dataset["tab"] === state.tab))
  }
  const device = deviceById(state.deviceId) as Device
  replace(body, ...TABS[state.tab](device, state))
}

function sameView(a: AppState, b: AppState): boolean {
  return a.deviceId === b.deviceId && a.tab === b.tab && a.run === b.run && a.revealed === b.revealed && a.delivery === b.delivery
}

/** Client entry: builds the store and the drawing client, then mounts the app regions. */
import "@design/tokens.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"
import "@fontsource/ibm-plex-mono/600.css"
import "@fontsource-variable/inter"
import "./styles.css"
import layout from "@design/layout.json"
import { devices } from "@shared/registry"
import { DrawingClient } from "./drawings/client"
import DrawWorker from "./drawings/worker?worker"
import { send } from "./liveSend"
import { h } from "./ui/dom"
import { clockText, header } from "./ui/header"
import { deviceList } from "./ui/deviceList"
import { stage } from "./ui/stage"
import { inspector } from "./ui/inspector"
import { bindPane, paneNav } from "./ui/paneNav"
import { bindPointerLight, LIGHT_QUERY } from "./ui/pointerLight"
import { bindTheme, browserStorage, readTheme, type Theme, type ThemeEnv, type ThemeStorage } from "./ui/theme"
import { themeToggle } from "./ui/themeToggle"
import { pipelineStrip } from "./ui/pipelineStrip"
import type { RunDeps } from "./ui/runner"
import { IDLE_RUN, Store, type AppState } from "./ui/store"

const COMPACT = `(max-width: ${layout.compactBelow.value - 1}px)`

/** On a narrow screen the labels are too small to read, so they start off and the drawing starts zoomed in. */
function initialState(compact: boolean, theme: Theme): AppState {
  const deviceId = devices[0]?.id ?? ""
  return { deviceId, tab: "overview", pane: "stage", explosion: 1, labels: !compact, zoom: compact ? layout.compactZoom.value : 1, catalogFilter: "all", theme, part: null, ...IDLE_RUN }
}

function tick(clock: HTMLElement): void {
  const [day, time] = clockText(new Date())
  clock.replaceChildren(h("span", {}, [day]), h("b", {}, [time]))
}

function schedule(callback: () => void, delayMs: number): void {
  setTimeout(callback, delayMs)
}

/** What the theme code needs from the page: the root element, the stored choice and the system dark query. */
function themeEnv(storage: ThemeStorage): ThemeEnv {
  return { root: document.documentElement, storage, media: window.matchMedia("(prefers-color-scheme: dark)") }
}

function mount(root: HTMLElement): void {
  const storage = browserStorage()
  const store = new Store(initialState(window.matchMedia(COMPACT).matches, readTheme(storage)))
  const clock = h("div", { class: "clock" })
  tick(clock)
  setInterval(tick.bind(null, clock), 1000)
  const deps: RunDeps = { send, schedule, now: Date.now }
  const drawings = new DrawingClient(new DrawWorker())
  const env = themeEnv(storage)
  bindTheme(env, store)
  const dock = h("div", { class: "dock" }, [pipelineStrip(store, deps), paneNav(store)])
  bindPane(root, store)
  bindPointerLight(document.body, window.matchMedia(LIGHT_QUERY))
  root.replaceChildren(header(clock, themeToggle(env, store)), deviceList(store, drawings), stage(store, drawings, schedule), inspector(store), dock)
}

mount(document.getElementById("app") as HTMLElement)

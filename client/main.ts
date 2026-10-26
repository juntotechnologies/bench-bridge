/** Client entry: builds the store and the drawing client, then mounts the app regions. */
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"
import "@fontsource/ibm-plex-mono/600.css"
import "@fontsource-variable/inter"
import "./styles.css"
import { devices } from "@shared/registry"
import { DrawingClient } from "./drawings/client"
import DrawWorker from "./drawings/worker?worker"
import { send } from "./liveSend"
import layout from "./layout.json"
import { h } from "./ui/dom"
import { clockText, header } from "./ui/header"
import { deviceList } from "./ui/deviceList"
import { stage } from "./ui/stage"
import { inspector } from "./ui/inspector"
import { bindPane, paneNav } from "./ui/paneNav"
import { pipelineStrip } from "./ui/pipelineStrip"
import type { RunDeps } from "./ui/runner"
import { IDLE_RUN, Store, type AppState } from "./ui/store"

const COMPACT = `(max-width: ${layout.compactBelow - 1}px)`

/** On a narrow screen the labels are too small to read, so they start off and the drawing starts zoomed in. */
function initialState(compact: boolean): AppState {
  const deviceId = devices[0]?.id ?? ""
  return { deviceId, tab: "overview", pane: "stage", explosion: 1, labels: !compact, zoom: compact ? layout.compactZoom : 1, ...IDLE_RUN }
}

function tick(clock: HTMLElement): void {
  const [day, time] = clockText(new Date())
  clock.replaceChildren(h("span", {}, [day]), h("b", {}, [time]))
}

function schedule(callback: () => void, delayMs: number): void {
  setTimeout(callback, delayMs)
}

function mount(root: HTMLElement): void {
  const store = new Store(initialState(window.matchMedia(COMPACT).matches))
  const clock = h("div", { class: "clock" })
  tick(clock)
  setInterval(tick.bind(null, clock), 1000)
  const deps: RunDeps = { send, schedule }
  const drawings = new DrawingClient(new DrawWorker())
  const dock = h("div", { class: "dock" }, [pipelineStrip(store, deps), paneNav(store)])
  bindPane(root, store)
  root.replaceChildren(header(clock), deviceList(store, drawings), stage(store, drawings), inspector(store), dock)
}

mount(document.getElementById("app") as HTMLElement)

/** Client entry: builds the store and the drawing client, then mounts the five app regions. */
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"
import "@fontsource/ibm-plex-mono/600.css"
import "@fontsource-variable/inter"
import "./styles.css"
import { devices } from "@shared/registry"
import { DrawingClient } from "./drawings/client"
import DrawWorker from "./drawings/worker?worker"
import { send } from "./liveSend"
import { h } from "./ui/dom"
import { clockText, header } from "./ui/header"
import { deviceList } from "./ui/deviceList"
import { stage } from "./ui/stage"
import { inspector } from "./ui/inspector"
import { pipelineStrip } from "./ui/pipelineStrip"
import type { RunDeps } from "./ui/runner"
import { IDLE_RUN, Store, type AppState } from "./ui/store"

const INITIAL: AppState = { deviceId: devices[0]?.id ?? "", tab: "overview", explosion: 1, labels: true, zoom: 1, ...IDLE_RUN }

function tick(clock: HTMLElement): void {
  const [day, time] = clockText(new Date())
  clock.replaceChildren(h("span", {}, [day]), h("b", {}, [time]))
}

function schedule(callback: () => void, delayMs: number): void {
  setTimeout(callback, delayMs)
}

function mount(root: HTMLElement): void {
  const store = new Store(INITIAL)
  const clock = h("div", { class: "clock" })
  tick(clock)
  setInterval(tick.bind(null, clock), 1000)
  const deps: RunDeps = { send, schedule }
  const drawings = new DrawingClient(new DrawWorker())
  root.replaceChildren(header(clock), deviceList(store, drawings), stage(store, drawings), inspector(store), pipelineStrip(store, deps))
}

mount(document.getElementById("app") as HTMLElement)

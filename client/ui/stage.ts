import { copy, deviceById, devices } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import type { DrawingClient } from "../drawings/client"
import { logEvent } from "@shared/log"
import { h, replace, svg } from "./dom"
import { icon } from "./icons"
import type { AppState, Store } from "./store"

const SPACING_STEP = 0.1
const ZOOM_STEP = 0.2
const ZOOM_RANGE: [number, number] = [0.6, 2.4]
const FRAME_MS = 45

interface StageParts {
  sheet: HTMLElement
  titleBlock: HTMLElement
  status: HTMLElement
  controls: ControlRefs
}

export function stage(store: Store, drawings: DrawingClient): HTMLElement {
  const parts: StageParts = {
    sheet: h("div", { class: "sheet", attrs: { "aria-busy": "true" } }),
    titleBlock: h("div", { class: "title-block" }),
    status: h("div", { class: "render-status", attrs: { "aria-live": "polite" } }),
    controls: controlRefs(store),
  }
  store.subscribe(update.bind(null, store, drawings, parts))
  update(store, drawings, parts, store.get(), null)
  const bar = h("div", { class: "stage-controls" }, controlBar(store, parts.controls))
  return h("main", { class: "stage" }, [parts.sheet, parts.status, parts.titleBlock, bar])
}

function update(store: Store, drawings: DrawingClient, parts: StageParts, state: AppState, previous: AppState | null): void {
  const device = deviceById(state.deviceId) as Device
  if (needsDrawing(state, previous)) void paint(store, drawings, parts, state)
  if (previous?.deviceId !== state.deviceId) prewarm(drawings, device.id)
  parts.sheet.style.setProperty("--zoom", String(state.zoom))
  replace(parts.titleBlock, ...titleRows(device))
  syncControls(parts.controls, state)
}

function needsDrawing(state: AppState, previous: AppState | null): boolean {
  if (!previous) return true
  return state.deviceId !== previous.deviceId || state.explosion !== previous.explosion || state.labels !== previous.labels
}

async function paint(store: Store, drawings: DrawingClient, parts: StageParts, state: AppState): Promise<void> {
  parts.status.textContent = copy.stage.rendering
  try {
    const markup = await drawings.draw(state.deviceId, state.explosion, state.labels && isSettled(state.explosion))
    if (isCurrent(store.get(), state)) showDrawing(parts, markup)
  } catch (error) {
    logEvent("drawing.failed", { deviceId: state.deviceId, message: String(error) }, "error")
  }
}

function showDrawing(parts: StageParts, markup: string): void {
  parts.sheet.innerHTML = `<svg class="drawing" viewBox="0 0 420 297" role="img">${markup}</svg>`
  parts.sheet.setAttribute("aria-busy", "false")
  parts.status.textContent = ""
}

/** Labels show only at rest: mid-animation frames skip them, as the teardown viewer does. */
function isSettled(explosion: number): boolean {
  return explosion === 0 || explosion === 1
}

function isCurrent(now: AppState, drawn: AppState): boolean {
  return now.deviceId === drawn.deviceId && now.explosion === drawn.explosion && now.labels === drawn.labels
}

function prewarm(drawings: DrawingClient, deviceId: string): void {
  for (const explosion of spacingStops()) void drawings.draw(deviceId, explosion, false)
  void drawings.draw(deviceId, 1, true)
}

function spacingStops(): number[] {
  return Array.from({ length: Math.round(1 / SPACING_STEP) + 1 }, stopAt)
}

function stopAt(_: unknown, i: number): number {
  return Math.round(i * SPACING_STEP * 100) / 100
}

function titleRows(device: Device): HTMLElement[] {
  const number = String(devices.indexOf(device) + 1).padStart(3, "0")
  return [
    h("div", { class: "tb-row" }, [h("span", {}, [copy.stage.drawingNo]), h("b", {}, [`${copy.stage.drawingPrefix}-${number}`])]),
    h("div", { class: "tb-row tb-name" }, [h("b", {}, [device.name])]),
    h("div", { class: "tb-row" }, [h("span", {}, [device.model]), h("span", {}, [String(device.era)])]),
    h("div", { class: "tb-row tb-foot" }, [copy.stage.sheet]),
  ]
}

interface ControlRefs {
  assembled: HTMLButtonElement
  exploded: HTMLButtonElement
  slider: HTMLInputElement
  labels: HTMLButtonElement
  zoom: HTMLSpanElement
}

function controlRefs(store: Store): ControlRefs {
  return {
    assembled: h("button", { on: { click: animateTo.bind(null, store, 0) } }, [copy.stage.assembled]),
    exploded: h("button", { on: { click: animateTo.bind(null, store, 1) } }, [copy.stage.exploded]),
    slider: h("input", {
      attrs: { type: "range", min: 0, max: 1, step: SPACING_STEP, "aria-label": copy.stage.spacing },
      on: { input: onSpacing.bind(null, store) },
    }),
    labels: h("button", { class: "chip", on: { click: toggleLabels.bind(null, store) } }, [svg(icon("tag", 14)), copy.stage.labels]),
    zoom: h("span"),
  }
}

function controlBar(store: Store, refs: ControlRefs): HTMLElement[] {
  return [
    h("div", { class: "segmented" }, [refs.assembled, refs.exploded]),
    h("label", { class: "slider" }, [h("span", { class: "eyebrow" }, [copy.stage.spacing]), refs.slider]),
    refs.labels,
    h("div", { class: "zoom" }, [
      h("button", { attrs: { "aria-label": copy.stage.zoomOut }, on: { click: zoomBy.bind(null, store, -ZOOM_STEP) } }, [svg(icon("minus", 14))]),
      refs.zoom,
      h("button", { attrs: { "aria-label": copy.stage.zoomIn }, on: { click: zoomBy.bind(null, store, ZOOM_STEP) } }, [svg(icon("plus", 14))]),
      h("button", { attrs: { "aria-label": copy.stage.zoomReset }, on: { click: zoomReset.bind(null, store) } }, [svg(icon("reset", 14))]),
    ]),
  ]
}

function syncControls(refs: ControlRefs, state: AppState): void {
  refs.assembled.classList.toggle("is-on", state.explosion === 0)
  refs.exploded.classList.toggle("is-on", state.explosion > 0)
  refs.slider.value = String(state.explosion)
  refs.labels.classList.toggle("is-on", state.labels)
  refs.labels.setAttribute("aria-pressed", String(state.labels))
  refs.zoom.textContent = `${Math.round(state.zoom * 100)}%`
}

function onSpacing(store: Store, event: Event): void {
  store.set({ explosion: Number((event.target as HTMLInputElement).value) })
}

function toggleLabels(store: Store): void {
  store.set({ labels: !store.get().labels })
}

function zoomBy(store: Store, step: number): void {
  const zoom = Math.round((store.get().zoom + step) * 10) / 10
  store.set({ zoom: Math.min(ZOOM_RANGE[1], Math.max(ZOOM_RANGE[0], zoom)) })
}

function zoomReset(store: Store): void {
  store.set({ zoom: 1 })
}

/** Step the spacing one stop per frame toward the target; cached frames make it smooth. */
function animateTo(store: Store, target: number): void {
  const current = store.get().explosion
  if (current === target) return
  const next = stopAt(null, Math.round(current / SPACING_STEP) + Math.sign(target - current))
  store.set({ explosion: next })
  if (next !== target) setTimeout(animateTo.bind(null, store, target), FRAME_MS)
}

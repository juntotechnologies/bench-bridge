/** The drawing stage: the sheet, title block and the view, spacing, label and zoom controls. */
import { copy, deviceById, devices } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import type { DrawingClient } from "../drawings/client"
import { logEvent } from "@shared/log"
import { h, replace, svg } from "./dom"
import { icon } from "./icons"
import { animateTo, annotates, cancelMotion, prewarm, SPACING_STEP, type Motion, type MotionDeps } from "./motion"
import type { Schedule } from "./runner"
import type { AppState, Store } from "./store"

const ZOOM_STEP = 0.2
const ZOOM_RANGE: [number, number] = [0.6, 2.4]

interface StageParts {
  sheet: HTMLElement
  titleBlock: HTMLElement
  status: HTMLElement
  controls: ControlRefs
}

interface StageContext {
  store: Store
  drawings: DrawingClient
  parts: StageParts
}

export function stage(store: Store, drawings: DrawingClient, schedule: Schedule): HTMLElement {
  const motion: Motion = { run: 0 }
  const deps: MotionDeps = { painter: drawings, schedule, motion }
  const parts: StageParts = {
    sheet: h("div", { class: "sheet", attrs: { "aria-busy": "true" } }),
    titleBlock: h("div", { class: "title-block" }),
    status: h("div", { class: "render-status", attrs: { "aria-live": "polite" } }),
    controls: controlRefs(store, deps),
  }
  const context: StageContext = { store, drawings, parts }
  store.subscribe(update.bind(null, context))
  update(context, store.get(), null)
  const bar = h("div", { class: "stage-controls" }, controlBar(store, parts.controls))
  return h("main", { class: "stage" }, [parts.sheet, parts.status, parts.titleBlock, bar])
}

function update(context: StageContext, state: AppState, previous: AppState | null): void {
  const { drawings, parts } = context
  const device = deviceById(state.deviceId) as Device
  if (needsDrawing(state, previous)) void paint(context, state)
  if (previous?.deviceId !== state.deviceId) prewarm(drawings, device.id, state.explosion)
  parts.sheet.style.setProperty("--zoom", String(state.zoom))
  replace(parts.titleBlock, ...titleRows(device))
  syncControls(parts.controls, state)
}

function needsDrawing(state: AppState, previous: AppState | null): boolean {
  if (!previous) return true
  return state.deviceId !== previous.deviceId || state.explosion !== previous.explosion || state.labels !== previous.labels
}

async function paint(context: StageContext, state: AppState): Promise<void> {
  context.parts.status.textContent = copy.stage.rendering
  const markup = await drawOrLog(context.drawings, state)
  if (markup !== null && isCurrent(context.store.get(), state)) showDrawing(context.parts, markup)
}

async function drawOrLog(drawings: DrawingClient, state: AppState): Promise<string | null> {
  try {
    return await drawings.draw(state.deviceId, state.explosion, annotates(state))
  } catch (error) {
    logEvent("drawing.failed", { deviceId: state.deviceId, message: String(error) }, "error")
    return null
  }
}

function showDrawing(parts: StageParts, markup: string): void {
  parts.sheet.innerHTML = `<svg class="drawing" viewBox="0 0 420 297" role="img">${markup}</svg>`
  parts.sheet.setAttribute("aria-busy", "false")
  parts.status.textContent = ""
}

function isCurrent(now: AppState, drawn: AppState): boolean {
  return now.deviceId === drawn.deviceId && now.explosion === drawn.explosion && now.labels === drawn.labels
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

function controlRefs(store: Store, deps: MotionDeps): ControlRefs {
  return {
    assembled: h("button", { on: { click: animateTo.bind(null, store, deps, 0) } }, [copy.stage.assembled]),
    exploded: h("button", { on: { click: animateTo.bind(null, store, deps, 1) } }, [copy.stage.exploded]),
    slider: h("input", {
      attrs: { type: "range", min: 0, max: 1, step: SPACING_STEP, "aria-label": copy.stage.spacing },
      on: { input: onSpacing.bind(null, store, deps.motion) },
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

function onSpacing(store: Store, motion: Motion, event: Event): void {
  cancelMotion(motion)
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

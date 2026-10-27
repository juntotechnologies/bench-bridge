/** The pipeline strip: five stage cards and the Run button, kept in step with the run state. */
import { copy, stages } from "@shared/registry"
import type { Stage } from "@shared/registry/schema"
import { h, svg } from "./dom"
import { elapsedText } from "./elapsed"
import { icon } from "./icons"
import { startRun, type RunDeps } from "./runner"
import type { AppState, Store } from "./store"

const TICK_MS = 100

export function pipelineStrip(store: Store, deps: RunDeps): HTMLElement {
  const cards = stages.map(stageCard)
  const run = h("button", { class: "run", on: { click: startRun.bind(null, store, deps) } })
  store.subscribe(onChange.bind(null, { store, deps, cards, run }))
  sync(cards, run, store.get())
  return h("footer", { class: "pipeline" }, [h("div", { class: "eyebrow strip-label" }, [copy.panels.pipeline]), ...cards, run])
}

function stageCard(stage: Stage, index: number): HTMLElement {
  return h("div", { class: "stage-card", attrs: { title: stage.detail, "data-glow": true } }, [
    h("span", { class: "stage-icon" }, [svg(icon(stage.icon, 20))]),
    h("div", {}, [h("div", { class: "stage-label" }, [h("span", { class: "stage-no" }, [`${index + 1}. `]), stage.label]), h("div", { class: "stage-detail" }, [stage.detail])]),
    h("span", { class: "stage-done" }, [svg(icon("check", 11))]),
  ])
}

interface StripParts {
  store: Store
  deps: RunDeps
  cards: HTMLElement[]
  run: HTMLButtonElement
}

function onChange(parts: StripParts, state: AppState, previous: AppState): void {
  sync(parts.cards, parts.run, state)
  if (isRunning(state) && !isRunning(previous)) tickElapsed(parts)
}

function isRunning(state: AppState): boolean {
  return state.revealed > 0 && state.revealed < stages.length
}

function sync(cards: HTMLElement[], run: HTMLButtonElement, state: AppState): void {
  cards.forEach(syncCard.bind(null, state.revealed))
  run.disabled = isRunning(state)
  run.replaceChildren(svg(icon("play", 14)), runLabel(state))
}

function runLabel(state: AppState): HTMLElement {
  if (!isRunning(state)) return h("span", {}, [state.revealed ? copy.run.again : copy.run.start])
  return h("span", {}, [copy.run.running, " ", h("span", { class: "run-elapsed" }, [elapsedText(state.startedAt ?? 0, state.startedAt ?? 0)])])
}

/** Keeps the readout on the button current while the run goes on. */
function tickElapsed(parts: StripParts): void {
  const state = parts.store.get()
  const readout = parts.run.querySelector(".run-elapsed")
  if (!isRunning(state) || !readout) return
  readout.textContent = elapsedText(state.startedAt ?? 0, parts.deps.now())
  parts.deps.schedule(tickElapsed.bind(null, parts), TICK_MS)
}

function syncCard(revealed: number, card: HTMLElement, index: number): void {
  card.classList.toggle("is-done", index < revealed - 1 || revealed === stages.length)
  card.classList.toggle("is-active", index === revealed - 1 && revealed < stages.length)
}

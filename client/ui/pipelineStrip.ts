/** The pipeline strip: five stage cards and the Run button, kept in step with the run state. */
import { copy, stages } from "@shared/registry"
import type { Stage } from "@shared/registry/schema"
import { h, svg } from "./dom"
import { icon } from "./icons"
import { startRun, type RunDeps } from "./runner"
import type { AppState, Store } from "./store"

export function pipelineStrip(store: Store, deps: RunDeps): HTMLElement {
  const cards = stages.map(stageCard)
  const run = h("button", { class: "run", on: { click: startRun.bind(null, store, deps) } })
  store.subscribe(sync.bind(null, cards, run))
  sync(cards, run, store.get())
  return h("footer", { class: "pipeline" }, [h("div", { class: "eyebrow strip-label" }, [copy.panels.pipeline]), ...cards, run])
}

function stageCard(stage: Stage, index: number): HTMLElement {
  return h("div", { class: "stage-card", attrs: { title: stage.detail } }, [
    h("span", { class: "stage-icon" }, [svg(icon(stage.icon, 20))]),
    h("div", {}, [h("div", { class: "stage-label" }, [`${index + 1}. ${stage.label}`]), h("div", { class: "stage-detail" }, [stage.detail])]),
    h("span", { class: "stage-done" }, [svg(icon("check", 11))]),
  ])
}

function sync(cards: HTMLElement[], run: HTMLButtonElement, state: AppState): void {
  cards.forEach(syncCard.bind(null, state.revealed))
  const running = state.revealed > 0 && state.revealed < stages.length
  run.disabled = running
  run.replaceChildren(svg(icon("play", 14)), runLabel(running, state.revealed))
}

function runLabel(running: boolean, revealed: number): string {
  if (running) return copy.run.running
  return revealed ? copy.run.again : copy.run.start
}

function syncCard(revealed: number, card: HTMLElement, index: number): void {
  card.classList.toggle("is-done", index < revealed - 1 || revealed === stages.length)
  card.classList.toggle("is-active", index === revealed - 1 && revealed < stages.length)
}

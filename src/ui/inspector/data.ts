import { copy } from "../../registry"
import type { Device, ParserConfig } from "../../registry/schema"
import { stampLines } from "../../bridge/capture"
import type { BridgeRun, CapturedLine, Reading } from "../../bridge/types"
import { h } from "../dom"

type ReadingView = (run: BridgeRun) => HTMLElement

const READING_VIEWS: Partial<Record<ParserConfig["kind"], ReadingView>> = { "plate-matrix": plateGrid }

export function dataTab(device: Device, run: BridgeRun | null, revealed: number): HTMLElement[] {
  const lines = run?.captured ?? stampLines(device.capture)
  const view = READING_VIEWS[device.parser.kind] ?? readingTable
  return [
    h("div", { class: "eyebrow" }, [copy.data.raw, h("span", { class: "port-tag" }, [device.port.kind])]),
    terminal(lines, revealed >= 1),
    h("div", { class: "eyebrow" }, [copy.data.parsed]),
    run && revealed >= 2 ? view(run) : h("p", { class: "empty" }, [copy.data.empty]),
  ]
}

function terminal(lines: CapturedLine[], live: boolean): HTMLElement {
  return h("ol", { class: live ? "terminal is-live" : "terminal" }, lines.map(terminalLine))
}

function terminalLine(line: CapturedLine, index: number): HTMLElement {
  const style = `--i:${index}`
  return h("li", { attrs: { style } }, [h("time", {}, [line.at.slice(11, 19)]), h("code", {}, [line.text])])
}

interface Outcome {
  raw: Reading
  kept: Reading | null
}

function readingTable(run: BridgeRun): HTMLElement {
  return h("table", { class: "readings" }, [h("tbody", {}, outcomes(run).map(readingRow))])
}

/** Pair each raw reading with its normalized form; rules keep order, so kept readings line up. */
function outcomes(run: BridgeRun): Outcome[] {
  const queue = [...run.normalized.kept]
  return run.readings.map(pairOutcome.bind(null, run.normalized.dropped, queue))
}

function pairOutcome(dropped: Reading[], queue: Reading[], raw: Reading): Outcome {
  return { raw, kept: dropped.includes(raw) ? null : (queue.shift() ?? null) }
}

function readingRow({ raw, kept }: Outcome): HTMLElement {
  const shown = kept ?? raw
  const tone = !kept ? "is-dropped" : shown.alarm ? "is-alarm" : ""
  return h("tr", { class: tone }, [
    h("td", {}, [shown.quantity]),
    h("td", { class: "num" }, [h("b", {}, [String(shown.value)]), " ", shown.unit]),
    h("td", { class: "dim" }, [shown.takenAt.slice(11, 19)]),
    h("td", {}, [statusChip(shown, kept !== null)]),
  ])
}

function statusChip(reading: Reading, kept: boolean): HTMLElement {
  if (!kept) return h("span", { class: "pill is-muted" }, [copy.data.dropped])
  if (reading.alarm) return h("span", { class: "pill is-alarm" }, [copy.data.alarm])
  return h("span", { class: "pill" }, [reading.status])
}

function plateGrid(run: BridgeRun): HTMLElement {
  const max = Math.max(...run.normalized.kept.map(valueOf))
  return h("div", { class: "plate" }, run.normalized.kept.map(wellCell.bind(null, max)))
}

function wellCell(max: number, reading: Reading): HTMLElement {
  const title = `${reading.extras["well"]} · ${reading.value} ${reading.unit}`
  return h("span", { attrs: { title, style: `--v:${(reading.value / max).toFixed(3)}` } })
}

function valueOf(reading: Reading): number {
  return reading.value
}

import { copy } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { stampLines } from "@shared/bridge/capture"
import type { BridgeRun, CapturedLine, Reading } from "@shared/bridge/types"
import { h, type Child } from "../dom"
import type { AppState } from "../store"

export function dataTab(device: Device, state: AppState): Child[] {
  const { run, revealed } = state
  const lines = run?.captured ?? stampLines(device.capture)
  return [
    h("div", { class: "eyebrow" }, [copy.data.raw, h("span", { class: "port-tag" }, [device.port.kind])]),
    terminal(lines, revealed >= 1),
    h("div", { class: "eyebrow" }, [copy.data.parsed]),
    run && revealed >= 2 ? readingTable(run, revealed) : null,
    run && revealed >= 3 ? resultCard(run) : h("p", { class: "empty" }, [copy.data.empty]),
  ]
}

function terminal(lines: CapturedLine[], live: boolean): HTMLElement {
  return h("ol", { class: live ? "terminal is-live" : "terminal" }, lines.map(terminalLine))
}

function terminalLine(line: CapturedLine, index: number): HTMLElement {
  const style = `--i:${index}`
  return h("li", { attrs: { style } }, [h("time", {}, [line.at.slice(11, 19)]), h("code", {}, [line.text])])
}

function readingTable(run: BridgeRun, revealed: number): HTMLElement {
  const rows = run.readings.map(readingRow.bind(null, run, revealed >= 3))
  return h("table", { class: "readings" }, [h("tbody", {}, rows)])
}

function resultCard(run: BridgeRun): HTMLElement {
  const result = run.normalized.kept[0]
  if (!result) return h("p", { class: "empty" }, [copy.data.empty])
  return h("div", { class: "result" }, [h("div", { class: "eyebrow" }, [result.quantity]), h("b", {}, [String(result.value), " ", result.unit])])
}

function readingRow(run: BridgeRun, ruled: boolean, reading: Reading): HTMLElement {
  const dropped = ruled && run.normalized.dropped.includes(reading)
  return h("tr", { class: dropped ? "is-dropped" : "" }, [
    h("td", {}, [reading.quantity]),
    h("td", { class: "num" }, [h("b", {}, [reading.value.toFixed(4)]), " ", reading.unit]),
    h("td", { class: "dim" }, [reading.takenAt.slice(11, 19)]),
    h("td", {}, [h("span", { class: dropped ? "pill is-muted" : "pill" }, [dropped ? copy.data.dropped : reading.status])]),
  ])
}

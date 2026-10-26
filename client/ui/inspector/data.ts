/** The Data tab: raw capture lines, parsed readings and the result card. */
import { copy } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { stampLines } from "@shared/bridge/capture"
import { printed } from "@shared/bridge/numbers"
import { retentionText } from "@shared/bridge/peaks"
import type { BridgeRun, CapturedLine, Normalized, Reading } from "@shared/bridge/types"
import { chartCard } from "../chart/card"
import { h, type Child } from "../dom"
import type { AppState } from "../store"

const RULED_STAGE = 3

export function dataTab(device: Device, state: AppState): Child[] {
  const lines = state.run?.captured ?? stampLines(device.capture)
  return [
    h("div", { class: "eyebrow" }, [copy.data.raw, h("span", { class: "port-tag" }, [device.port.kind])]),
    terminal(lines, state.revealed >= 1),
    h("div", { class: "eyebrow" }, [copy.data.parsed]),
    ...parsedSection(state),
  ]
}

function parsedSection(state: AppState): Child[] {
  const { run, revealed } = state
  if (!run || revealed < 2) return [h("p", { class: "empty" }, [copy.data.empty])]
  const ruled = revealed >= RULED_STAGE
  return [chartCard(run, ruled), readingTable(run, revealed), ruled ? resultCard(run) : null]
}

function terminal(lines: CapturedLine[], live: boolean): HTMLElement {
  return h("ol", { class: live ? "terminal is-live" : "terminal" }, lines.map(terminalLine))
}

function terminalLine(line: CapturedLine, index: number): HTMLElement {
  const style = `--i:${index}`
  return h("li", { attrs: { style } }, [h("time", {}, [line.at.slice(11, 19)]), h("code", {}, [line.text])])
}

function readingTable(run: BridgeRun, revealed: number): HTMLElement {
  const ruled = revealed >= RULED_STAGE
  const rows = run.readings.map(readingRow.bind(null, run, ruled))
  const table = h("table", { class: "readings" }, [h("tbody", {}, rows)])
  return h("div", { class: "diff" }, [diffHead(), table, ruled ? diffFoot(run) : null])
}

function diffHead(): HTMLElement {
  return h("header", { class: "diff-head" }, [h("b", {}, [copy.data.diffTitle]), h("span", {}, [copy.data.diffHint])])
}

/** The footer line of the diff table: how many readings the rules dropped and how many they kept. */
export function diffSummary(normalized: Normalized): string {
  return [`${normalized.dropped.length} ${copy.data.droppedCount}`, `${normalized.stable.length} ${copy.data.keptCount}`].join(" · ")
}

function diffFoot(run: BridgeRun): HTMLElement {
  return h("footer", { class: "diff-foot" }, [diffSummary(run.normalized)])
}

function resultCard(run: BridgeRun): HTMLElement {
  const result = run.normalized.kept[0]
  if (!result) return h("p", { class: "empty" }, [copy.data.empty])
  return h("div", { class: "result" }, [h("div", { class: "eyebrow" }, [result.quantity]), h("b", {}, [String(result.value), " ", result.unit])])
}

/** When a weight was taken, or when a peak came off the column. */
export function readingDetail(reading: Reading): string {
  const minutes = reading.extras["minutes"]
  return minutes === undefined ? reading.takenAt.slice(11, 19) : `${retentionText(Number(minutes))} ${copy.data.minutes}`
}

/** The stability flag of a weight, or the role of a peak. */
export function readingTag(reading: Reading): string {
  return String(reading.extras["role"] ?? reading.status)
}

function rowClass(ruled: boolean, dropped: boolean): string {
  if (!ruled) return ""
  return dropped ? "is-dropped" : "is-kept"
}

function readingRow(run: BridgeRun, ruled: boolean, reading: Reading): HTMLElement {
  const dropped = ruled && run.normalized.dropped.includes(reading)
  return h("tr", { class: rowClass(ruled, dropped) }, [
    h("td", {}, [reading.quantity]),
    h("td", { class: "num" }, [h("b", {}, [printed(reading)]), " ", reading.unit]),
    h("td", { class: "dim" }, [readingDetail(reading)]),
    h("td", {}, [h("span", { class: dropped ? "pill is-muted" : "pill" }, [dropped ? copy.data.dropped : readingTag(reading)])]),
  ])
}

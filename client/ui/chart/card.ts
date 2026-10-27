/** The chart card: a title, the chart and a key, shown above the readings table. */
import type { BridgeRun } from "@shared/bridge/types"
import { h } from "../dom"
import { chartFor } from "./model"
import { chartSvg } from "./render"
import type { Chart, KeyItem } from "./types"

/** The card for the run's chart, or null when the readings have no chart. */
export function chartCard(run: BridgeRun, ruled: boolean): HTMLElement | null {
  const chart = chartFor(run, ruled)
  return chart === null ? null : h("figure", { class: "chart-card" }, [header(chart), chartSvg(chart), keyRow(chart)])
}

function header(chart: Chart): HTMLElement {
  return h("figcaption", {}, [h("b", {}, [chart.title]), h("span", {}, [chart.hint])])
}

function keyRow(chart: Chart): HTMLElement {
  return h("ul", { class: "chart-key" }, chart.key.map(keyItem))
}

function keyItem(item: KeyItem): HTMLElement {
  return h("li", { class: `is-${item.swatch}` }, [item.label])
}

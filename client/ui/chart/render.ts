/** Draws a chart model as SVG: axes, lines, dots and notes, with every colour and size left to the stylesheet. */
import { s } from "../dom"
import { linear, type Scale } from "./scale"
import type { Chart, Dot, Line, Note, Tick, Vec } from "./types"

const WIDTH = 320
const HEIGHT = 150
const MARGIN = { top: 12, right: 14, bottom: 26, left: 34 }
const DOT_RADIUS = 4
const TICK_GAP = 14

interface Plot {
  x: Scale
  y: Scale
  baseline: number
  left: number
  right: number
}

export function chartSvg(chart: Chart): SVGElement {
  const plot = plotOf(chart)
  const lines = chart.lines.map(lineNode.bind(null, plot))
  const dots = chart.dots.map(dotNode.bind(null, plot))
  const notes = chart.notes.map(noteNode.bind(null, plot))
  const attrs = { class: "chart", viewBox: `0 0 ${WIDTH} ${HEIGHT}`, role: "img", "aria-label": chart.title }
  return s("svg", attrs, [...grid(chart, plot), ...lines, ...dots, ...notes, ...axisLabels(chart, plot)])
}

function plotOf(chart: Chart): Plot {
  const baseline = HEIGHT - MARGIN.bottom
  const left = MARGIN.left
  const right = WIDTH - MARGIN.right
  return { x: linear(chart.x.domain, [left, right]), y: linear(chart.y.domain, [baseline, MARGIN.top]), baseline, left, right }
}

function grid(chart: Chart, plot: Plot): SVGElement[] {
  const rows = chart.y.ticks.map(rowNode.bind(null, plot))
  const columns = chart.x.ticks.map(columnNode.bind(null, plot))
  return [s("line", { class: "chart-axis", x1: plot.left, x2: plot.right, y1: plot.baseline, y2: plot.baseline }), ...rows, ...columns]
}

function rowNode(plot: Plot, tick: Tick): SVGElement {
  const y = plot.y(tick.at)
  const line = s("line", { class: "chart-grid", x1: plot.left, x2: plot.right, y1: y, y2: y })
  return s("g", {}, [line, s("text", { class: "chart-tick", x: plot.left - 6, y: y + 3, "text-anchor": "end" }, [tick.label])])
}

function columnNode(plot: Plot, tick: Tick): SVGElement {
  return s("text", { class: "chart-tick", x: plot.x(tick.at), y: plot.baseline + TICK_GAP, "text-anchor": "middle" }, [tick.label])
}

function lineNode(plot: Plot, line: Line): SVGElement {
  const path = pathOf(plot, line.points)
  const stroke = s("path", { class: `chart-line is-${line.state}`, d: path, pathLength: 1 })
  const area = line.state === "main" ? s("path", { class: "chart-area", d: areaOf(plot, line.points) }) : null
  return s("g", {}, [area, stroke, s("title", {}, [line.title])])
}

function pathOf(plot: Plot, points: Vec[]): string {
  return points.map(commandOf.bind(null, plot)).join(" ")
}

function commandOf(plot: Plot, point: Vec, index: number): string {
  return `${index === 0 ? "M" : "L"}${plot.x(point.x).toFixed(1)} ${plot.y(point.y).toFixed(1)}`
}

function areaOf(plot: Plot, points: Vec[]): string {
  const first = points[0] ?? { x: 0, y: 0 }
  const last = points[points.length - 1] ?? first
  return `${pathOf(plot, points)} L${plot.x(last.x).toFixed(1)} ${plot.baseline} L${plot.x(first.x).toFixed(1)} ${plot.baseline} Z`
}

function dotNode(plot: Plot, dot: Dot): SVGElement {
  const attrs = { class: `chart-dot is-${dot.state}`, cx: plot.x(dot.at.x), cy: plot.y(dot.at.y), r: DOT_RADIUS }
  return s("circle", attrs, [s("title", {}, [dot.title])])
}

function noteNode(plot: Plot, note: Note): SVGElement {
  const attrs = { class: "chart-note", x: plot.x(note.at.x), y: plot.y(note.at.y) + note.lift, "text-anchor": note.anchor }
  return s("text", attrs, [note.text])
}

function axisLabels(chart: Chart, plot: Plot): SVGElement[] {
  const middle = (plot.left + plot.right) / 2
  const unit = s("text", { class: "chart-unit", x: middle, y: HEIGHT - 3, "text-anchor": "middle" }, [chart.x.label])
  const side = s("text", { class: "chart-unit", x: plot.left, y: MARGIN.top - 5, "text-anchor": "start" }, [chart.y.label])
  return [unit, side]
}

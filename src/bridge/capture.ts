import type { Capture } from "../registry/schema"
import type { CapturedLine } from "./types"

export function stampLines(capture: Capture): CapturedLine[] {
  const start = Date.parse(capture.startedAt)
  return capture.lines.map(stampLine.bind(null, start, capture.cadenceMs))
}

function stampLine(start: number, cadenceMs: number, text: string, index: number): CapturedLine {
  return { at: new Date(start + index * cadenceMs).toISOString(), text }
}

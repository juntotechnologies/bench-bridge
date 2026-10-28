/** Parser table: one parser per protocol kind in the registry. */
import type { ParserConfig } from "../../registry/schema"
import type { CapturedLine, Reading } from "../types"
import { parseCsvExport } from "./csvExport"
import { parseLabelledLines } from "./labelledLines"
import { parsePeakTable } from "./peakTable"
import { parsePhLines } from "./phLine"
import { parseSicsLines } from "./sicsLine"

type Kind = ParserConfig["kind"]
type Parser<K extends Kind> = (config: Extract<ParserConfig, { kind: K }>, lines: CapturedLine[], sampleId: string) => Reading[]

const PARSERS: { [K in Kind]: Parser<K> } = {
  "sics-line": parseSicsLines,
  "peak-table": parsePeakTable,
  "ph-line": parsePhLines,
  "labelled-lines": parseLabelledLines,
  "csv-export": parseCsvExport,
}

export function parseCapture(config: ParserConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return runParser(config.kind, config, lines, sampleId)
}

function runParser<K extends Kind>(kind: K, config: Extract<ParserConfig, { kind: K }>, lines: CapturedLine[], sampleId: string): Reading[] {
  return PARSERS[kind](config, lines, sampleId)
}

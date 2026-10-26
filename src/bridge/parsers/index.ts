import type { ParserConfig } from "../../registry/schema"
import type { CapturedLine, Reading } from "../types"
import { parseAnalogLoop } from "./analogLoop"
import { parseEventLog } from "./eventLog"
import { parseGpibQueries } from "./gpibQuery"
import { parsePlateMatrix } from "./plateMatrix"
import { parsePrintout } from "./printout"
import { parseSicsLines } from "./sicsLine"

type Parser<K extends ParserConfig["kind"]> = (
  config: Extract<ParserConfig, { kind: K }>,
  lines: CapturedLine[],
  sampleId: string,
) => Reading[]

const PARSERS: { [K in ParserConfig["kind"]]: Parser<K> } = {
  "sics-line": parseSicsLines,
  printout: parsePrintout,
  "gpib-query": parseGpibQueries,
  "plate-matrix": parsePlateMatrix,
  "event-log": parseEventLog,
  "analog-loop": parseAnalogLoop,
}

export function parseCapture(config: ParserConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  const parser = PARSERS[config.kind] as Parser<typeof config.kind>
  return parser(config as never, lines, sampleId)
}

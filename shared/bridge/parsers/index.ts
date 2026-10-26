/** Parser table: one parser per protocol kind in the registry. */
import type { ParserConfig } from "../../registry/schema"
import type { CapturedLine, Reading } from "../types"
import { parseSicsLines } from "./sicsLine"

type Parser<K extends ParserConfig["kind"]> = (
  config: Extract<ParserConfig, { kind: K }>,
  lines: CapturedLine[],
  sampleId: string,
) => Reading[]

const PARSERS: { [K in ParserConfig["kind"]]: Parser<K> } = {
  "sics-line": parseSicsLines,
}

export function parseCapture(config: ParserConfig, lines: CapturedLine[], sampleId: string): Reading[] {
  return PARSERS[config.kind](config, lines, sampleId)
}

/** The pure bridge pipeline: capture, parse, normalize and map. Delivery belongs to the server. */
import type { Device } from "../registry/schema"
import type { BridgeRun } from "./types"
import { stampLines } from "./capture"
import { parseCapture } from "./parsers"
import { normalize } from "./normalize"
import { mapRecords } from "./map"

export function runBridge(device: Device): BridgeRun {
  const captured = stampLines(device.capture)
  const readings = parseCapture(device.parser, captured, device.capture.sampleId)
  const normalized = normalize(device.normalize, readings)
  return { captured, readings, normalized, mapped: mapRecords(device, normalized.kept) }
}

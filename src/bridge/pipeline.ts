import type { Device, Target, TargetId } from "../registry/schema"
import type { BridgeRun, DeliveryDeps } from "./types"
import { stampLines } from "./capture"
import { parseCapture } from "./parsers"
import { normalize } from "./normalize"
import { mapRecords } from "./map"
import { deliver } from "./deliver"

export function runBridge(device: Device, targets: Record<TargetId, Target>, deps: DeliveryDeps): BridgeRun {
  const captured = stampLines(device.capture)
  const readings = parseCapture(device.parser, captured, device.capture.sampleId)
  const normalized = normalize(device.normalize, readings)
  const mapped = mapRecords(device, normalized.kept)
  return { captured, readings, normalized, mapped, receipts: deliver(targets, mapped, deps) }
}

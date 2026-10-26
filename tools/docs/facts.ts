/** Demo facts for the docs, computed by running the real pipeline and server handler, never typed by hand. */
import { runBridge } from "@shared/bridge/pipeline"
import type { BridgeRun, Reading } from "@shared/bridge/types"
import { DeliverResponse } from "@shared/contracts"
import { catalog, devices, isLive } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { handleDeliver } from "@server/handler"
import { createDeps } from "@server/refs"

export interface Facts {
  [key: string]: string
}

export function buildFacts(): Facts {
  return Object.assign({}, catalogFacts(), ...devices.map(deviceFacts))
}

function catalogFacts(): Facts {
  const live = catalog.filter(isLive).length
  return { "catalog.count": String(catalog.length), "catalog.live": String(live), "catalog.planned": String(catalog.length - live) }
}

function deviceFacts(device: Device): Facts {
  const run = runBridge(device)
  const response = deliverOnce(device, run)
  return prefixed(device.id, { ...identityFacts(device), ...runFacts(run), ...receiptFacts(response), ...ledgerFacts(response) })
}

function deliverOnce(device: Device, run: BridgeRun): DeliverResponse {
  const result = handleDeliver(createDeps(), { deviceId: device.id, records: run.mapped })
  return DeliverResponse.parse(result.body)
}

function prefixed(id: string, facts: Facts): Facts {
  return Object.fromEntries(Object.entries(facts).map(prefixEntry.bind(null, id)))
}

function prefixEntry(id: string, [key, value]: [string, string]): [string, string] {
  return [`${id}.${key}`, value]
}

function identityFacts(device: Device): Facts {
  return {
    name: device.name,
    model: device.model,
    era: String(device.era),
    kit: device.kit,
    "port.kind": device.port.kind,
    "port.connector": device.port.connector,
    "port.settings": device.port.settings,
    "port.pins": String(device.port.pins.length),
    "today.count": String(device.today.length),
  }
}

function runFacts(run: BridgeRun): Facts {
  return { ...countFacts(run), ...weightFacts(run) }
}

function countFacts(run: BridgeRun): Facts {
  return {
    "run.lines": String(run.captured.length),
    "run.stable": String(run.normalized.stable.length),
    "run.unstable": String(run.normalized.dropped.length),
  }
}

function weightFacts(run: BridgeRun): Facts {
  return { ...stableFacts(run.normalized.stable), ...usedFacts(run.normalized.kept) }
}

function stableFacts(stable: Reading[]): Facts {
  return { "run.first": valueText(stable[0]), "run.last": valueText(stable[stable.length - 1]) }
}

function usedFacts(kept: Reading[]): Facts {
  return { "run.used": valueText(kept[0]), "run.unit": kept[0]?.unit ?? "" }
}

function valueText(reading: Reading | undefined): string {
  return reading ? String(reading.value) : ""
}

function receiptFacts(response: DeliverResponse): Facts {
  return Object.fromEntries(response.receipts.map(receiptEntry))
}

function receiptEntry(receipt: DeliverResponse["receipts"][number]): [string, string] {
  return [`receipt.${receipt.target}`, receipt.ref ?? ""]
}

function ledgerFacts(response: DeliverResponse): Facts {
  const line = response.ledger
  if (!line) return {}
  return {
    "ledger.ref": line.containerRef,
    "ledger.substance": line.substance,
    "ledger.schedule": line.schedule,
    "ledger.opening": String(line.opening),
    "ledger.closing": String(line.closing),
    "ledger.unit": line.unit,
  }
}

/** The deliver endpoint logic: validate the request, deliver the records and build the ledger line. */
import { DeliverRequest, type DeliverResponse, type LedgerLine, type MappedRecord, type Receipt } from "@shared/contracts"
import { logEvent } from "@shared/log"
import { targets } from "@shared/registry"
import { containerByRef } from "./containers"
import { deliver, type DeliveryDeps } from "./deliver"
import { ledgerLine } from "./ledger"

export interface HttpResult {
  status: number
  body: unknown
}

export function handleDeliver(deps: DeliveryDeps, body: unknown): HttpResult {
  const parsed = DeliverRequest.safeParse(body)
  if (!parsed.success) return { status: 400, body: { error: "invalid_request" } }
  const { deviceId, records } = parsed.data
  const receipts = deliver(targets, records, deps)
  receipts.filter(isRejected).forEach(logRejection.bind(null, deviceId))
  const response: DeliverResponse = { receipts, ledger: ledgerFor(records, receipts) }
  return { status: 200, body: response }
}

export function handleHealth(): HttpResult {
  return { status: 200, body: { ok: true } }
}

function ledgerFor(records: MappedRecord[], receipts: Receipt[]): LedgerLine | null {
  const used = records.filter(isAcceptedLedger.bind(null, receipts))
  const container = containerByRef(String(used[0]?.fields["container_ref"]))
  return container ? ledgerLine(container, totalUsed(used)) : null
}

function isAcceptedLedger(receipts: Receipt[], record: MappedRecord, index: number): boolean {
  return record.target === "ledger" && receipts[index]?.accepted === true
}

function totalUsed(records: MappedRecord[]): number {
  return records.reduce(addQuantity, 0)
}

function addQuantity(total: number, record: MappedRecord): number {
  return total + Number(record.fields["quantity_used"] ?? 0)
}

function isRejected(receipt: Receipt): boolean {
  return !receipt.accepted
}

function logRejection(deviceId: string, receipt: Receipt): void {
  const fields = { deviceId, target: receipt.target, readingIndex: receipt.readingIndex, missing: receipt.missing.join(",") }
  logEvent("delivery.rejected", fields, "warn")
}

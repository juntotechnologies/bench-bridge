/** The Deliver tab: the ledger line the server returns, and each target's payload and receipts. */
import { copy, targets } from "@shared/registry"
import type { Device, TargetId } from "@shared/registry/schema"
import type { LedgerLine, MappedRecord, Receipt } from "@shared/contracts"
import { h, type Child } from "../dom"
import { codeBlock } from "../codeBlock"
import type { AppState } from "../store"
import { recordsTable } from "./receipts"

const PAYLOAD_STAGE = 4
const RECEIPT_STAGE = 5

export function deliverTab(device: Device, state: AppState): Child[] {
  const cards = device.deliveries.map(targetCard.bind(null, state))
  const ledger = state.delivery?.ledger
  return [ledger ? ledgerCard(ledger) : null, state.failed ? failure() : null, ...cards]
}

/** The DEA-facing view: the container's running balance before and after this use. */
function ledgerCard(line: LedgerLine): HTMLElement {
  return h("section", { class: "ledger" }, [
    h("div", { class: "eyebrow" }, [`${line.containerRef} · ${copy.deliver.schedule} ${line.schedule}`]),
    h("b", { class: "ledger-substance" }, [line.substance]),
    h("div", { class: "ledger-row" }, [
      amount(copy.deliver.opening, `${line.opening.toFixed(4)} ${line.unit}`, ""),
      amount("−", line.used.toFixed(4), "is-used"),
      amount(copy.deliver.closing, `${line.closing.toFixed(4)} ${line.unit}`, ""),
    ]),
  ])
}

function amount(label: string, value: string, tone: string): HTMLElement {
  return h("div", { class: tone }, [h("span", {}, [label]), h("b", {}, [value])])
}

function failure(): HTMLElement {
  return h("p", { class: "empty" }, [copy.deliver.failed])
}

function targetCard(state: AppState, delivery: Device["deliveries"][number]): HTMLElement {
  const target = targets[delivery.target]
  return h("section", { class: "target" }, [
    h("header", {}, [h("b", {}, [target.label]), h("span", {}, [target.record]), h("code", {}, [target.endpoint])]),
    state.revealed >= PAYLOAD_STAGE ? payload(recordsFor(state, delivery.target)) : fieldList(Object.keys(delivery.fields)),
    state.revealed >= RECEIPT_STAGE ? recordsTable(receiptsFor(state, delivery.target)) : null,
  ])
}

function recordsFor(state: AppState, target: TargetId): MappedRecord[] {
  return (state.run?.mapped ?? []).filter(forTarget.bind(null, target))
}

function receiptsFor(state: AppState, target: TargetId): Receipt[] {
  return (state.delivery?.receipts ?? []).filter(forTarget.bind(null, target))
}

function forTarget(target: TargetId, item: MappedRecord | Receipt): boolean {
  return item.target === target
}

function fieldList(fields: string[]): HTMLElement {
  return h("div", { class: "fields" }, fields.map(fieldChip))
}

function fieldChip(field: string): HTMLElement {
  return h("code", {}, [field])
}

function payload(records: MappedRecord[]): HTMLElement {
  const first = records[0]?.fields ?? {}
  const more = records.length > 1 ? h("div", { class: "dim" }, [`+ ${records.length - 1} ${copy.deliver.more}`]) : null
  return h("div", { class: "payload" }, [
    h("div", { class: "eyebrow" }, [copy.deliver.payload, h("span", {}, [`${records.length}`])]),
    codeBlock({ label: copy.deliver.payloadFile, text: JSON.stringify(first, null, 2) }),
    more,
  ])
}

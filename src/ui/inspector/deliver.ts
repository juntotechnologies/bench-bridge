import { copy, targets } from "../../registry"
import type { Device, TargetId } from "../../registry/schema"
import type { BridgeRun, MappedRecord, Receipt } from "../../bridge/types"
import { h, svg } from "../dom"
import { icon } from "../icons"

const SHOWN_REFS = 4

export function deliverTab(device: Device, run: BridgeRun | null, revealed: number): HTMLElement[] {
  return device.deliveries.map(targetCard.bind(null, run, revealed))
}

function targetCard(run: BridgeRun | null, revealed: number, delivery: Device["deliveries"][number]): HTMLElement {
  const target = targets[delivery.target]
  const records = run?.mapped.filter(forTarget.bind(null, delivery.target)) ?? []
  const receipts = run?.receipts.filter(forTarget.bind(null, delivery.target)) ?? []
  return h("section", { class: "target" }, [
    h("header", {}, [h("b", {}, [target.label]), h("span", {}, [target.record]), h("code", {}, [target.endpoint])]),
    revealed >= 4 ? payload(records) : fieldList(Object.keys(delivery.fields)),
    revealed >= 5 ? receiptList(receipts) : null,
  ])
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
    h("pre", {}, [JSON.stringify(first, null, 2)]),
    more,
  ])
}

function receiptList(receipts: Receipt[]): HTMLElement {
  const accepted = receipts.filter(isAccepted)
  const rejected = receipts.filter(isRejected)
  return h("div", { class: "receipts" }, [
    ...accepted.slice(0, SHOWN_REFS).map(acceptedChip),
    accepted.length > SHOWN_REFS ? h("span", { class: "dim" }, [`+ ${accepted.length - SHOWN_REFS}`]) : null,
    ...rejected.map(rejectedChip),
  ])
}

function acceptedChip(receipt: Receipt): HTMLElement {
  return h("span", { class: "receipt" }, [svg(icon("check", 12)), receipt.ref ?? ""])
}

function rejectedChip(receipt: Receipt): HTMLElement {
  return h("span", { class: "receipt is-rejected" }, [svg(icon("cross", 12)), `${copy.deliver.missing}: ${receipt.missing.join(", ")}`])
}

function isAccepted(receipt: Receipt): boolean {
  return receipt.accepted
}

function isRejected(receipt: Receipt): boolean {
  return !receipt.accepted
}

import { containerByRef, copy, targets } from "../../registry"
import type { Device, TargetId } from "../../registry/schema"
import type { BridgeRun, MappedRecord, Receipt } from "../../bridge/types"
import { ledgerLine } from "../../bridge/ledger"
import { h, svg, type Child } from "../dom"
import { icon } from "../icons"

const SHOWN_REFS = 4

export function deliverTab(device: Device, run: BridgeRun | null, revealed: number): Child[] {
  return [ledgerCard(device, run, revealed), ...device.deliveries.map(targetCard.bind(null, run, revealed))]
}

/** The DEA-facing view: the container's running balance before and after this use. */
function ledgerCard(device: Device, run: BridgeRun | null, revealed: number): HTMLElement | null {
  const container = containerByRef(device.capture.containerRef)
  if (!container) return null
  const used = revealed >= 5 ? (run?.normalized.kept[0]?.value ?? 0) : 0
  const line = ledgerLine(container, used)
  return h("section", { class: "ledger" }, [
    h("div", { class: "eyebrow" }, [`${container.ref} · ${copy.deliver.schedule} ${container.schedule}`]),
    h("b", { class: "ledger-substance" }, [container.substance]),
    h("div", { class: "ledger-row" }, [
      h("div", {}, [h("span", {}, [copy.deliver.opening]), h("b", {}, [`${line.opening.toFixed(4)} ${line.unit}`])]),
      h("div", { class: used ? "is-used" : "" }, [h("span", {}, ["−"]), h("b", {}, [`${line.used.toFixed(4)}`])]),
      h("div", {}, [h("span", {}, [copy.deliver.closing]), h("b", {}, [`${line.closing.toFixed(4)} ${line.unit}`])]),
    ]),
  ])
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

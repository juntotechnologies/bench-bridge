/** The records table of the Deliver tab: one row for each receipt a target sent back. */
import { copy } from "@shared/registry"
import type { Receipt } from "@shared/contracts"
import { h, svg } from "../dom"
import { icon } from "../icons"

const SHOWN_ROWS = 4

export interface ReceiptCells {
  record: string
  ref: string
  time: string
  accepted: boolean
  missing: string
}

export function receiptCells(receipt: Receipt): ReceiptCells {
  return {
    record: String(receipt.readingIndex + 1),
    ref: receipt.ref ?? "",
    time: receipt.at.slice(11, 19),
    accepted: receipt.accepted,
    missing: receipt.missing.join(", "),
  }
}

export function recordsTable(receipts: Receipt[]): HTMLElement {
  const rows = receipts.slice(0, SHOWN_ROWS).map(receiptRow)
  const extra = receipts.length - SHOWN_ROWS
  return h("div", { class: "records" }, [
    h("table", {}, [tableHead(), h("tbody", {}, rows)]),
    extra > 0 ? h("footer", {}, [`+ ${extra} ${copy.deliver.more}`]) : null,
  ])
}

function tableHead(): HTMLElement {
  const columns = [copy.deliver.record, copy.deliver.reference, copy.deliver.received, copy.deliver.status]
  return h("thead", {}, [h("tr", {}, columns.map(headCell))])
}

function headCell(label: string): HTMLElement {
  return h("th", {}, [label])
}

function receiptRow(receipt: Receipt): HTMLElement {
  const cells = receiptCells(receipt)
  return h("tr", { class: cells.accepted ? "is-accepted" : "is-rejected" }, [
    h("td", { class: "dim" }, [cells.record]),
    h("td", { class: "num" }, [cells.ref || copy.deliver.none]),
    h("td", { class: "dim" }, [cells.time]),
    h("td", {}, [statusTag(cells)]),
  ])
}

function statusTag(cells: ReceiptCells): HTMLElement {
  const mark = svg(icon(cells.accepted ? "check" : "cross", 11))
  const label = cells.accepted ? copy.deliver.accepted : copy.deliver.rejected
  const detail = cells.accepted ? null : h("div", { class: "dim" }, [`${copy.deliver.missing}: ${cells.missing}`])
  return h("div", { class: "tag-stack" }, [h("span", { class: cells.accepted ? "pill" : "pill is-danger" }, [mark, label]), detail])
}

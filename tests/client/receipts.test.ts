/** Tests for the receipt rows: what each cell of the records table says. */
import { describe, expect, it } from "vitest"
import { receiptCells } from "@client/ui/inspector/receipts"
import type { Receipt } from "@shared/contracts"

const accepted: Receipt = { target: "lims", readingIndex: 0, accepted: true, ref: "RES-000001", at: "2026-10-26T14:02:16.400Z", missing: [] }
const rejected: Receipt = { target: "ledger", readingIndex: 2, accepted: false, ref: null, at: "2026-10-26T14:02:17.000Z", missing: ["container_ref", "unit"] }

describe("receiptCells", () => {
  it("numbers the record from one and shows the reference and the time of day", () => {
    expect(receiptCells(accepted)).toEqual({ record: "1", ref: "RES-000001", time: "14:02:16", accepted: true, missing: "" })
  })

  it("names the missing fields of a rejected record and shows no reference", () => {
    expect(receiptCells(rejected)).toEqual({ record: "3", ref: "", time: "14:02:17", accepted: false, missing: "container_ref, unit" })
  })
})

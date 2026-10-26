/** Wire contract between client and server: mapped records in, receipts and the ledger line out. */
import { z } from "zod"
import { TargetId } from "./registry/schema"

export const DELIVER_PATH = "/api/deliver"
export const HEALTH_PATH = "/api/health"

export const FieldValue = z.union([z.string(), z.number(), z.boolean()])

export const MappedRecord = z.object({
  target: TargetId,
  readingIndex: z.number().int().nonnegative(),
  fields: z.record(z.string(), FieldValue),
})

export const Receipt = z.object({
  target: TargetId,
  readingIndex: z.number().int().nonnegative(),
  accepted: z.boolean(),
  ref: z.string().nullable(),
  at: z.string(),
  missing: z.array(z.string()),
})

export const LedgerLine = z.object({
  containerRef: z.string(),
  substance: z.string(),
  schedule: z.string(),
  opening: z.number(),
  used: z.number(),
  closing: z.number(),
  unit: z.string(),
})

export const DeliverRequest = z.object({ deviceId: z.string(), records: z.array(MappedRecord) })
export const DeliverResponse = z.object({ receipts: z.array(Receipt), ledger: LedgerLine.nullable() })

export type FieldValue = z.infer<typeof FieldValue>
export type MappedRecord = z.infer<typeof MappedRecord>
export type Receipt = z.infer<typeof Receipt>
export type LedgerLine = z.infer<typeof LedgerLine>
export type DeliverRequest = z.infer<typeof DeliverRequest>
export type DeliverResponse = z.infer<typeof DeliverResponse>

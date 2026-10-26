import type { Target, TargetId } from "../registry/schema"
import type { DeliveryDeps, MappedRecord, Receipt } from "./types"

/** Mock target endpoints: they accept a record only when every required field is present. */
export function deliver(targets: Record<TargetId, Target>, records: MappedRecord[], deps: DeliveryDeps): Receipt[] {
  return records.map(receiptFor.bind(null, targets, deps))
}

function receiptFor(targets: Record<TargetId, Target>, deps: DeliveryDeps, record: MappedRecord): Receipt {
  const target = targets[record.target]
  const missing = target.required.filter(isAbsent.bind(null, record))
  const accepted = missing.length === 0
  const ref = accepted ? deps.nextRef(target.refPrefix) : null
  return { target: record.target, readingIndex: record.readingIndex, accepted, ref, at: deps.now(), missing }
}

function isAbsent(record: MappedRecord, field: string): boolean {
  return !(field in record.fields)
}

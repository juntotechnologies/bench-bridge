import type { Container } from "../registry/schema"
import { round } from "./numbers"

const MASS_PLACES = 4

export interface LedgerLine {
  opening: number
  used: number
  closing: number
  unit: string
}

/** The running balance after one use; a negative closing balance means the books do not reconcile. */
export function ledgerLine(container: Container, used: number): LedgerLine {
  return { opening: container.balance, used, closing: round(container.balance - used, MASS_PLACES), unit: container.unit }
}

/** Ledger arithmetic: a container's balance before and after the amount used. */
import type { LedgerLine } from "@shared/contracts"
import { round } from "@shared/bridge/numbers"
import type { Container } from "./containers"

const MASS_PLACES = 4

export function ledgerLine(container: Container, used: number): LedgerLine {
  return {
    containerRef: container.ref,
    substance: container.substance,
    schedule: container.schedule,
    opening: container.balance,
    used,
    closing: round(container.balance - used, MASS_PLACES),
    unit: container.unit,
  }
}

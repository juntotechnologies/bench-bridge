/** Controlled-substance container records: the opening balances, validated once at load. */
import { z } from "zod"
import ledgerJson from "./data/ledger.json"

export const Container = z.object({
  ref: z.string(),
  substance: z.string(),
  schedule: z.string(),
  balance: z.number(),
  unit: z.string(),
})

export type Container = z.infer<typeof Container>

export const containers = z.array(Container).parse(ledgerJson)

export function containerByRef(ref: string): Container | undefined {
  return containers.find(matchesRef.bind(null, ref))
}

function matchesRef(ref: string, container: Container): boolean {
  return container.ref === ref
}

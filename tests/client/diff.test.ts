/** Tests for the diff table footer: it counts what the rules dropped and kept. */
import { describe, expect, it } from "vitest"
import { devices } from "@shared/registry"
import { runBridge } from "@shared/bridge/pipeline"
import { diffSummary } from "@client/ui/inspector/data"
import { buildFacts } from "../../tools/docs/facts"

describe("diffSummary", () => {
  it("counts the dropped and the stable readings of a real run, as the docs state them", () => {
    const facts = buildFacts()
    const summary = diffSummary(runBridge(devices[0]!).normalized)
    expect(summary).toBe(`${facts["balance.run.unstable"]} dropped · ${facts["balance.run.stable"]} kept`)
  })
})

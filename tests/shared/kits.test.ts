/** Drift checks for the kit registry: every device names a kit, every kit part resolves, and the data shows no prices. */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { deviceById, devices, kitById, kitParts, kits, kitSafeguards, partsOf, safeguardsOf, stages, kitTitle } from "@shared/registry"
import type { Device } from "@shared/registry/schema"

const COMPLIANCE_CLAIM = /part 11 compliant|is compliant|fully compliant|validated system/i

describe("the LAN file pickup kit", () => {
  const kit = kitById("lan-file")!

  it("fits the LC-MS/MS and has no pass-through, because nothing plugs into the instrument", () => {
    expect(deviceById("lc-ms")?.kit).toBe("lan-file")
    expect(kit.parts).not.toContain("port-out")
    expect(kitTitle(deviceById("lc-ms") as Device)).toBe("LAN file pickup")
  })

  it("keeps the pass-through in the title of a tap kit", () => {
    expect(kitTitle(deviceById("balance") as Device)).toBe("Serial tap with DB9 pass-through")
  })

  it("lists its own safeguards before the shared ones", () => {
    const own = kit.safeguards ?? []
    expect(own.map((step) => step.title)).toEqual(["Read-only share", "No instrument commands", "Hash of each file"])
    expect(safeguardsOf(kit)).toEqual([...own, ...kitSafeguards])
    expect(safeguardsOf(kitById("serial-tap")!)).toEqual(kitSafeguards)
  })
})

describe("the data makes no compliance claim", () => {
  it.each(readdirSync(join(__dirname, "../../shared/data")).filter((file) => file.endsWith(".json")))("%s claims no compliance", (file) => {
    expect(readFileSync(join(__dirname, "../../shared/data", file), "utf8")).not.toMatch(COMPLIANCE_CLAIM)
  })
})

const DATA = join(__dirname, "../../shared/data")
const PRICE = /\$\s?\d|\bUSD\b|\bprice/i

describe("kit registry", () => {
  it.each(devices.map((device) => [device.id, device.kit] as const))("%s names a known kit", (_id, kit) => {
    expect(kitById(kit)).toBeDefined()
  })

  it("has unique part ids and unique kit ids", () => {
    expect(new Set(kitParts.map((part) => part.id)).size).toBe(kitParts.length)
    expect(new Set(kits.map((kit) => kit.id)).size).toBe(kits.length)
  })

  it.each(kits.map((kit) => [kit.id] as const))("%s lists only parts that exist, once each", (id) => {
    const kit = kitById(id)
    expect(partsOf(kit!)).toHaveLength(kit!.parts.length)
    expect(new Set(kit!.parts).size).toBe(kit!.parts.length)
  })

  it("uses every part in at least one kit", () => {
    const used = new Set(kits.flatMap((kit) => kit.parts))
    expect(kitParts.filter((part) => !used.has(part.id)).map((part) => part.id)).toEqual([])
  })

  it.each(kits.map((kit) => [kit.id] as const))("%s has one flow step for each pipeline stage", (id) => {
    expect(kitById(id)?.flow).toHaveLength(stages.length)
  })
})

describe("the data shows no prices", () => {
  it.each(readdirSync(DATA).filter((file) => file.endsWith(".json")))("%s has no price text", (file) => {
    expect(readFileSync(join(DATA, file), "utf8")).not.toMatch(PRICE)
  })
})

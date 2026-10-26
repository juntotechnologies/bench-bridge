/** Tests for the in-browser delivery API: same answers as the server handler, with no network. */
import { describe, expect, it } from "vitest"
import { runBridge } from "@shared/bridge/pipeline"
import { DELIVER_PATH, DeliverResponse, HEALTH_PATH } from "@shared/contracts"
import { deviceById } from "@shared/registry"
import type { Device } from "@shared/registry/schema"
import { createStaticSend } from "@server/staticSend"

const balance = deviceById("balance") as Device

function deliverInit(): RequestInit {
  const body = JSON.stringify({ deviceId: balance.id, records: runBridge(balance).mapped })
  return { method: "POST", body }
}

describe("createStaticSend", () => {
  it("answers a deliver request with receipts and the ledger line", async () => {
    const response = await createStaticSend()(DELIVER_PATH, deliverInit())
    const parsed = DeliverResponse.parse(await response.json())
    expect(response.status).toBe(200)
    expect(parsed.receipts.map((receipt) => receipt.ref)).toEqual(["RES-000001", "CSU-000001"])
  })

  it("answers the health path", async () => {
    const response = await createStaticSend()(HEALTH_PATH)
    expect(await response.json()).toEqual({ ok: true })
  })

  it("answers 404 for an unknown path", async () => {
    expect((await createStaticSend()("/nope")).status).toBe(404)
  })

  it("answers 400 for a body that is not a deliver request", async () => {
    expect((await createStaticSend()(DELIVER_PATH, { method: "POST", body: "{}" })).status).toBe(400)
  })
})

/** Client side of the server API: posts mapped records and returns the validated response. */
import { DELIVER_PATH, DeliverResponse, type DeliverRequest } from "@shared/contracts"

export type Send = typeof fetch

export async function postDeliver(send: Send, request: DeliverRequest): Promise<DeliverResponse> {
  const response = await send(DELIVER_PATH, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`deliver failed: ${response.status}`)
  return DeliverResponse.parse(await response.json())
}

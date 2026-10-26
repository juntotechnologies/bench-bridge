import { deviceById } from "@shared/registry"
import { drawDevice } from "./draw"
import type { DrawReply, DrawRequest } from "./protocol"

function reply(request: DrawRequest): DrawReply {
  const device = deviceById(request.deviceId)
  if (!device) return { requestId: request.requestId, error: `Unknown device ${request.deviceId}` }
  const options = { explosion: request.explosion, fitExplosion: 1, annotate: request.annotate }
  return { requestId: request.requestId, markup: drawDevice(device, options).markup }
}

function onRequest(event: MessageEvent<DrawRequest>): void {
  try {
    self.postMessage(reply(event.data))
  } catch (error) {
    self.postMessage({ requestId: event.data.requestId, error: String(error) })
  }
}

self.addEventListener("message", onRequest)

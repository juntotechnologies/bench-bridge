/** Web worker that renders drawings off the main thread. */
import { drawById } from "./draw"
import type { DrawReply, DrawRequest } from "./protocol"

function reply(request: DrawRequest): DrawReply {
  const options = { explosion: request.explosion, fitExplosion: 1, annotate: request.annotate }
  return { requestId: request.requestId, markup: drawById(request.drawingId, options).markup }
}

function onRequest(event: MessageEvent<DrawRequest>): void {
  try {
    self.postMessage(reply(event.data))
  } catch (error) {
    self.postMessage({ requestId: event.data.requestId, error: String(error) })
  }
}

self.addEventListener("message", onRequest)

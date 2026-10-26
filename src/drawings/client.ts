import type { DrawReply, DrawRequest } from "./protocol"

type Pending = { resolve: (markup: string) => void; reject: (error: Error) => void }

/** Sends draw requests to the worker and caches each drawing by device, spacing and labels. */
export class DrawingClient {
  private readonly worker: Worker
  private readonly pending = new Map<number, Pending>()
  private readonly cache = new Map<string, Promise<string>>()
  private nextId = 1

  constructor(worker: Worker) {
    this.worker = worker
    this.worker.addEventListener("message", this.onReply.bind(this))
  }

  draw(deviceId: string, explosion: number, annotate: boolean): Promise<string> {
    const key = `${deviceId}:${explosion.toFixed(2)}:${annotate}`
    const cached = this.cache.get(key) ?? this.request({ requestId: this.nextId++, deviceId, explosion, annotate })
    this.cache.set(key, cached)
    return cached
  }

  private request(request: DrawRequest): Promise<string> {
    const promise = new Promise<string>(this.track.bind(this, request.requestId))
    this.worker.postMessage(request)
    return promise
  }

  private track(requestId: number, resolve: Pending["resolve"], reject: Pending["reject"]): void {
    this.pending.set(requestId, { resolve, reject })
  }

  private onReply(event: MessageEvent<DrawReply>): void {
    const reply = event.data
    const pending = this.pending.get(reply.requestId)
    this.pending.delete(reply.requestId)
    if ("error" in reply) pending?.reject(new Error(reply.error))
    else pending?.resolve(reply.markup)
  }
}

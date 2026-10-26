/** Vite plugin that serves the deliver and health endpoints from the dev server. */
import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin, ViteDevServer } from "vite"
import { DELIVER_PATH, HEALTH_PATH } from "@shared/contracts"
import type { DeliveryDeps } from "./deliver"
import { handleDeliver, handleHealth, type HttpResult } from "./handler"

const NOT_ALLOWED: HttpResult = { status: 405, body: { error: "method_not_allowed" } }

export function serverApi(deps: DeliveryDeps): Plugin {
  return { name: "bench-bridge-api", configureServer: mount.bind(null, deps) }
}

function mount(deps: DeliveryDeps, vite: ViteDevServer): void {
  vite.middlewares.use(DELIVER_PATH, answer.bind(null, deps))
  vite.middlewares.use(HEALTH_PATH, reply.bind(null, handleHealth))
}

async function answer(deps: DeliveryDeps, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const result = request.method === "POST" ? handleDeliver(deps, await readJson(request)) : NOT_ALLOWED
  send(response, result)
}

function reply(handle: () => HttpResult, _request: IncomingMessage, response: ServerResponse): void {
  send(response, handle())
}

function send(response: ServerResponse, result: HttpResult): void {
  response.statusCode = result.status
  response.setHeader("content-type", "application/json")
  response.end(JSON.stringify(result.body))
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } catch {
    return undefined
  }
}

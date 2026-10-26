/** The delivery API inside the browser: answers a request with no network, for the static site. */
import { DELIVER_PATH, HEALTH_PATH } from "@shared/contracts"
import type { DeliveryDeps } from "./deliver"
import { handleDeliver, handleHealth, type HttpResult } from "./handler"
import { createDeps } from "./refs"

export type StaticSend = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

type Handler = (deps: DeliveryDeps, body: unknown) => HttpResult

const ROUTES: Record<string, Handler> = { [DELIVER_PATH]: handleDeliver, [HEALTH_PATH]: handleHealth }
const NOT_FOUND: HttpResult = { status: 404, body: { error: "not_found" } }

export function createStaticSend(): StaticSend {
  return answer.bind(null, createDeps())
}

async function answer(deps: DeliveryDeps, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const handler = ROUTES[String(input)]
  const result = handler ? handler(deps, parseBody(init?.body)) : NOT_FOUND
  return new Response(JSON.stringify(result.body), { status: result.status, headers: { "content-type": "application/json" } })
}

function parseBody(body: BodyInit | null | undefined): unknown {
  return typeof body === "string" ? JSON.parse(body) : null
}

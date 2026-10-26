/** Health check: one command that fails unless the running dev server answers its health endpoint. */
import { HEALTH_PATH } from "@shared/contracts"
import dev from "./data/dev.json" with { type: "json" }

async function main(): Promise<void> {
  const response = await fetch(`http://127.0.0.1:${dev.port}${HEALTH_PATH}`)
  console.log(response.ok ? "ok" : `unhealthy: ${response.status}`)
  process.exitCode = response.ok ? 0 : 1
}

await main()

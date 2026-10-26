/** Dev entry: starts the client and the API on all interfaces and prints the one tailnet link. */
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { createServer } from "vite"
import dev from "./data/dev.json" with { type: "json" }
import { createDeps } from "./refs"
import { serverApi } from "./plugin"

const CLIENT_CONFIG = fileURLToPath(new URL("../client/vite.config.ts", import.meta.url))

interface TailnetHost {
  name: string
  ip: string
}

/** The tailnet name of this machine, read from Tailscale itself, so no host is written in code. */
function tailnetHost(): TailnetHost {
  const raw = execFileSync("tailscale", ["status", "--self", "--json"], { encoding: "utf8" })
  const self = JSON.parse(raw).Self
  return { name: String(self.DNSName).replace(/\.$/, ""), ip: String(self.TailscaleIPs[0]) }
}

async function main(): Promise<void> {
  const host = tailnetHost()
  const server = await createServer({
    configFile: CLIENT_CONFIG,
    logLevel: "warn",
    plugins: [serverApi(createDeps())],
    server: { host: "0.0.0.0", port: dev.port, strictPort: true, allowedHosts: [host.name, host.ip] },
  })
  await server.listen()
  console.log(`http://${host.name}:${dev.port}/`)
}

await main()

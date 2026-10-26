import { execFileSync } from "node:child_process"
import { createServer } from "vite"
import dev from "../data/dev.json" with { type: "json" }

/** The tailnet name of this machine, from Tailscale itself, so no host is hard-coded. */
function tailnetHost() {
  const status = JSON.parse(execFileSync("tailscale", ["status", "--self", "--json"], { encoding: "utf8" }))
  return { name: status.Self.DNSName.replace(/\.$/, ""), ip: status.Self.TailscaleIPs[0] }
}

const host = tailnetHost()
const server = await createServer({
  logLevel: "warn",
  server: { host: "0.0.0.0", port: dev.port, strictPort: true, allowedHosts: [host.name, host.ip] },
})
await server.listen()
console.log(`http://${host.name}:${dev.port}/`)

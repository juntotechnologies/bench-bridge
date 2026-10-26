/** Serves the built static site on a free port, for scripts that drive it in a browser. */
import { preview, type PreviewServer } from "vite"

export interface ServedSite {
  server: PreviewServer
  url: string
}

export async function serveSite(configFile: string): Promise<ServedSite> {
  const server = await preview({ configFile })
  return { server, url: server.resolvedUrls?.local[0] ?? "" }
}

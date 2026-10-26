/** Vite config for the Pages site: the client app, with its delivery API running inside the browser. */
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import pkg from "../package.json" with { type: "json" }

const repo = fileURLToPath(new URL("..", import.meta.url))
const LIVE_SEND = /^\.\/liveSend$/

export default defineConfig({
  root: `${repo}client`,
  base: new URL(pkg.homepage).pathname,
  resolve: {
    alias: [
      { find: "@shared", replacement: `${repo}shared` },
      { find: "@server", replacement: `${repo}server` },
      { find: LIVE_SEND, replacement: `${repo}site/send.ts` },
    ],
  },
  build: { outDir: `${repo}dist-pages`, emptyOutDir: true },
})

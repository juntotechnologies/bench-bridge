/** Vite config for the Pages site: the client app, its delivery API in the browser, and the public discovery files. */
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import pkg from "../package.json" with { type: "json" }
import { dropNotes } from "./dropNotes.ts"
import seo from "./seo.json" with { type: "json" }

const repo = fileURLToPath(new URL("..", import.meta.url))
const LIVE_SEND = /^\.\/liveSend$/
const OUT_DIR = `${repo}dist-pages`

export default defineConfig({
  root: `${repo}client`,
  base: new URL(pkg.homepage).pathname,
  publicDir: `${repo}${seo.publicDir}`,
  plugins: [dropNotes(OUT_DIR)],
  resolve: {
    alias: [
      { find: "@shared", replacement: `${repo}shared` },
      { find: "@server", replacement: `${repo}server` },
      { find: "@design", replacement: `${repo}design` },
      { find: LIVE_SEND, replacement: `${repo}site/send.ts` },
    ],
  },
  build: { outDir: OUT_DIR, emptyOutDir: true },
})

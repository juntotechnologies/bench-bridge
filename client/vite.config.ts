/** Vite config for the client: its root, the shared and design aliases, the public files and the repo-wide file allow list. */
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import seo from "../site/seo.json" with { type: "json" }

const repo = fileURLToPath(new URL("..", import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: { alias: { "@shared": `${repo}shared`, "@design": `${repo}design` } },
  publicDir: `${repo}${seo.publicDir}`,
  server: { fs: { allow: [repo] } },
  build: { outDir: `${repo}dist`, emptyOutDir: true },
})

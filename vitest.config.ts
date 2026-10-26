/** Vitest config: one root test directory and an alias for each code area. */
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const repo = fileURLToPath(new URL(".", import.meta.url))

export default defineConfig({
  resolve: { alias: { "@shared": `${repo}shared`, "@client": `${repo}client`, "@server": `${repo}server`, "@design": `${repo}design` } },
  test: { include: ["tests/**/*.test.ts"] },
})

/** Vite plugin: removes the AGENTS.md note from the build output, because publicDir copies the notes beside the files. */
import { rmSync } from "node:fs"
import { join } from "node:path"
import type { Plugin } from "vite"

const NOTE = "AGENTS.md"

export function removeNote(outDir: string): void {
  rmSync(join(outDir, NOTE), { force: true })
}

export function dropNotes(outDir: string): Plugin {
  return { name: "drop-notes", closeBundle: removeNote.bind(null, outDir) }
}

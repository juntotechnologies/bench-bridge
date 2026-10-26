/** Notes for generated tables: a schema for notes.json and a check that no note is stale. */
import { z } from "zod"
import notesJson from "./notes.json"

export const Notes = z.object({
  files: z.record(z.string(), z.string()),
  scripts: z.record(z.string(), z.string()),
})

export type Notes = z.infer<typeof Notes>

export const notes = Notes.parse(notesJson)

/** Notes whose file is gone or whose script no longer exists. */
export function staleNotes(source: Notes, fileExists: (path: string) => boolean, scripts: string[]): string[] {
  const files = Object.keys(source.files).filter(isAbsentFrom.bind(null, fileExists))
  const gone = Object.keys(source.scripts).filter(isNotListed.bind(null, scripts))
  return [...files.map(describe.bind(null, "file")), ...gone.map(describe.bind(null, "script"))]
}

function isAbsentFrom(fileExists: (path: string) => boolean, path: string): boolean {
  return !fileExists(path)
}

function isNotListed(names: string[], name: string): boolean {
  return !names.includes(name)
}

function describe(kind: string, name: string): string {
  return `note for missing ${kind}: ${name}`
}

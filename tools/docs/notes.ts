/** Notes for generated tables: a schema for notes.json and a check that no note is stale. */
import { z } from "zod"
import notesJson from "./notes.json"

export const Notes = z.object({
  files: z.record(z.string(), z.string()),
  scripts: z.record(z.string(), z.string()),
  generators: z.record(z.string(), z.object({ arg: z.string(), fills: z.string() })),
})

export type Notes = z.infer<typeof Notes>

/** Names that exist today, to compare the notes against. */
export interface Names {
  scripts: string[]
  generators: string[]
}

export const notes = Notes.parse(notesJson)

/** Notes whose file, script or generator is gone. */
export function staleNotes(source: Notes, fileExists: (path: string) => boolean, names: Names): string[] {
  return [
    ...staleOf("file", Object.keys(source.files), isAbsentFrom.bind(null, fileExists)),
    ...staleOf("script", Object.keys(source.scripts), isNotListed.bind(null, names.scripts)),
    ...staleOf("generator", Object.keys(source.generators), isNotListed.bind(null, names.generators)),
  ]
}

function staleOf(kind: string, keys: string[], isGone: (key: string) => boolean): string[] {
  return keys.filter(isGone).map(describe.bind(null, kind))
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

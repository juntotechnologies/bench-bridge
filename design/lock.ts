/** A hash of the source files. A copy of the spec in another project compares its files against it to find local edits. */
import { createHash } from "node:crypto"

export function lockText(sources: string[]): string {
  const hash = createHash("sha256")
  for (const text of sources) hash.update(text)
  return `${hash.digest("hex")}\n`
}

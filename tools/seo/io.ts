/** The one module that reads and writes the generated files, and finds which ones differ from their sources. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import type { TextFile } from "./files"
import { isCurrent, stamp, type ImagePlan } from "./images"

function readOrNull(root: string, path: string): Buffer | null {
  const full = join(root, path)
  return existsSync(full) ? readFileSync(full) : null
}

export function writeDeep(root: string, path: string, content: string | Buffer): void {
  const full = join(root, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content)
}

function isStaleText(root: string, file: TextFile): boolean {
  return readOrNull(root, file.path)?.toString("utf8") !== file.content
}

function isStaleImage(root: string, plan: ImagePlan): boolean {
  return !isCurrent(readOrNull(root, plan.spec.path), plan)
}

export function staleTexts(root: string, files: TextFile[]): TextFile[] {
  return files.filter(isStaleText.bind(null, root))
}

export function staleImages(root: string, plans: ImagePlan[]): ImagePlan[] {
  return plans.filter(isStaleImage.bind(null, root))
}

export function writeText(root: string, file: TextFile): void {
  writeDeep(root, file.path, file.content)
}

export function textPath(file: TextFile): string {
  return file.path
}

export function imagePath(plan: ImagePlan): string {
  return plan.spec.path
}

function pngAt(pngs: Buffer[], index: number): Buffer {
  const png = pngs[index]
  if (!png) throw new Error(`no drawn image at ${index}`)
  return png
}

/** Writes each drawn image, with the hash of its source, to the path its plan names. */
export function writeImages(root: string, plans: ImagePlan[], pngs: Buffer[]): void {
  for (const [index, plan] of plans.entries()) writeDeep(root, imagePath(plan), stamp(pngAt(pngs, index), plan))
}

/** The files that the Open Graph image draws from: fonts and the README screenshot, read from disk and named by hash or by data URL. */
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { z } from "zod"
import assetsJson from "./assets.json"

const Asset = z.strictObject({ path: z.string(), mime: z.string() })
const AssetTable = z.strictObject({ mono500: Asset, mono600: Asset, inter: Asset, screenshot: Asset })

export type AssetKey = keyof z.infer<typeof AssetTable>
export type AssetUrls = Record<AssetKey, string>

export interface AssetFile {
  bytes: Buffer
  mime: string
}

export type AssetFiles = Record<AssetKey, AssetFile>

const table = AssetTable.parse(assetsJson)
const KEYS = Object.keys(table) as AssetKey[]

type Namer = (file: AssetFile) => string

function readAsset(root: string, key: AssetKey): AssetFile {
  return { bytes: readFileSync(join(root, table[key].path)), mime: table[key].mime }
}

function readEntry(root: string, key: AssetKey): [AssetKey, AssetFile] {
  return [key, readAsset(root, key)]
}

function nameEntry(files: AssetFiles, name: Namer, key: AssetKey): [AssetKey, string] {
  return [key, name(files[key])]
}

export function readAssets(root: string): AssetFiles {
  return Object.fromEntries(KEYS.map(readEntry.bind(null, root))) as AssetFiles
}

function mapAssets(files: AssetFiles, name: Namer): AssetUrls {
  return Object.fromEntries(KEYS.map(nameEntry.bind(null, files, name))) as AssetUrls
}

function dataUrl(file: AssetFile): string {
  return `data:${file.mime};base64,${file.bytes.toString("base64")}`
}

function hashName(file: AssetFile): string {
  return `sha256-${createHash("sha256").update(file.bytes).digest("hex")}`
}

/** URLs that carry the bytes, so the browser can draw the page. */
export function dataUrls(files: AssetFiles): AssetUrls {
  return mapAssets(files, dataUrl)
}

/** Names that carry the hash of each file, so the source of an image changes when an asset changes. */
export function hashUrls(files: AssetFiles): AssetUrls {
  return mapAssets(files, hashName)
}

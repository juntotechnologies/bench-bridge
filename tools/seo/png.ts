/** PNG metadata: the image size, and a source hash kept in a tEXt chunk so a check can tell when an image is stale. */
import { createHash } from "node:crypto"
import { crc32 } from "node:zlib"

export const SOURCE_KEY = "source-sha256"

const SIGNATURE_LENGTH = 8
const IEND_LENGTH = 12
const CHUNK_OVERHEAD = 12

export interface PngSize {
  width: number
  height: number
}

interface Chunk {
  type: string
  data: Buffer
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex")
}

function encodeChunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data])
  const length = Buffer.alloc(4)
  const crc = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function readChunks(png: Buffer): Chunk[] {
  const chunks: Chunk[] = []
  let offset = SIGNATURE_LENGTH
  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    chunks.push({ type: png.toString("latin1", offset + 4, offset + 8), data: png.subarray(offset + 8, offset + 8 + length) })
    offset += length + CHUNK_OVERHEAD
  }
  return chunks
}

/** The PNG with a text chunk added just before the end chunk. */
export function embedText(png: Buffer, key: string, value: string): Buffer {
  const text = encodeChunk("tEXt", Buffer.from(`${key}\0${value}`, "latin1"))
  const end = png.length - IEND_LENGTH
  return Buffer.concat([png.subarray(0, end), text, png.subarray(end)])
}

function isTextChunk(key: string, chunk: Chunk): boolean {
  return chunk.type === "tEXt" && chunk.data.toString("latin1").split("\0")[0] === key
}

export function readText(png: Buffer, key: string): string | null {
  const chunk = readChunks(png).find(isTextChunk.bind(null, key))
  return chunk ? (chunk.data.toString("latin1").split("\0")[1] ?? null) : null
}

/** A whole PNG ends with the end chunk, so a cut file is not whole. */
export function isComplete(png: Buffer): boolean {
  return png.subarray(png.length - IEND_LENGTH).equals(encodeChunk("IEND", Buffer.alloc(0)))
}

export function readSize(png: Buffer): PngSize {
  const header = readChunks(png)[0]
  if (header?.type !== "IHDR") throw new Error("not a PNG file")
  return { width: header.data.readUInt32BE(0), height: header.data.readUInt32BE(4) }
}

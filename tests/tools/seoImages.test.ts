/** Tests for the image tools: the PNG text chunk, the image plan and the stale check, the icon pages and the Open Graph page. */
import { crc32, deflateSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { isCurrent, planImage, stamp, type ImagePlan } from "../../tools/seo/images"
import { imageSpecs } from "../../tools/seo/files"
import { renderFavicon, renderIconHtml } from "../../tools/seo/graphics"
import { renderOgHtml, type HtmlParts } from "../../tools/seo/og"
import { SOURCE_KEY, embedText, isComplete, readSize, readText, sha256 } from "../../tools/seo/png"
import { fixtureSite } from "./seoFixture"

const site = fixtureSite()
const parts: HtmlParts = { css: "body{}", urls: { mono500: "sha256-a", mono600: "sha256-b", inter: "sha256-c", screenshot: "sha256-d" } }

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  const crc = Buffer.alloc(4)
  const body = Buffer.concat([Buffer.from(type, "latin1"), data])
  length.writeUInt32BE(data.length)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function tinyPng(width: number, height: number): Buffer {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.alloc(1))), chunk("IEND", Buffer.alloc(0))])
}

describe("png text chunk", () => {
  it("reads back the text that it embeds, and keeps the size", () => {
    const png = embedText(tinyPng(3, 2), SOURCE_KEY, "abc")
    expect(readText(png, SOURCE_KEY)).toBe("abc")
    expect(readSize(png)).toEqual({ width: 3, height: 2 })
  })

  it("returns null when the key is absent", () => {
    expect(readText(tinyPng(1, 1), SOURCE_KEY)).toBeNull()
  })

  it("tells a whole file from a cut file", () => {
    const png = tinyPng(2, 2)
    expect(isComplete(png)).toBe(true)
    expect(isComplete(png.subarray(0, png.length - 3))).toBe(false)
  })

  it("throws on a file that is not a PNG", () => {
    expect(() => readSize(Buffer.alloc(40))).toThrow("not a PNG file")
  })
})

describe("image plan", () => {
  const spec = imageSpecs(site)[0] as ImagePlan["spec"]
  const plan = planImage(site, parts, spec)

  it("hashes the page source, so an asset change changes the hash", () => {
    const other = planImage(site, { ...parts, urls: { ...parts.urls, screenshot: "sha256-e" } }, spec)
    expect(plan.hash).toBe(sha256(spec.html(site, parts)))
    expect(other.hash).not.toBe(plan.hash)
  })

  it("is current only for a stamped image of the right size", () => {
    const right = stamp(tinyPng(spec.width, spec.height), plan)
    expect(isCurrent(right, plan)).toBe(true)
    expect(isCurrent(stamp(tinyPng(10, 10), plan), plan)).toBe(false)
    expect(isCurrent(tinyPng(spec.width, spec.height), plan)).toBe(false)
    expect(isCurrent(null, plan)).toBe(false)
    expect(isCurrent(right.subarray(0, right.length - 5), plan)).toBe(false)
  })

  it("is stale when the source hash differs", () => {
    const old = stamp(tinyPng(spec.width, spec.height), { ...plan, hash: "old" })
    expect(isCurrent(old, plan)).toBe(false)
  })
})

describe("imageSpecs", () => {
  it("lists the Open Graph image at 1200 by 630, then each icon as a square", () => {
    const sizes = imageSpecs(site).map((spec) => `${spec.path} ${spec.width}x${spec.height}`)
    expect(sizes).toEqual(["site/public/og.png 1200x630", "site/public/apple-touch-icon.png 180x180", "site/public/icon-192.png 192x192", "site/public/icon-512.png 512x512"])
  })
})

describe("pages that Chromium draws", () => {
  it("draws the favicon with the mark in the accent colour on the dark card", () => {
    const svg = renderFavicon(site)
    expect(svg).toContain('d="M0 0h1"')
    expect(svg).toContain(`stroke="${site.light.accent}"`)
    expect(svg).toContain(`fill="${site.light.card}"`)
  })

  it("draws a full-size square icon with no rounded corners", () => {
    expect(renderIconHtml(site)).toContain('rx="0"')
  })

  it("draws the Open Graph page from the headline, the tagline, the domain and the screenshot url", () => {
    const html = renderOgHtml(site, parts)
    expect(html).toContain(site.seo.headline)
    expect(html).toContain(site.seo.tagline)
    expect(html).toContain("bench-bridge.example.test")
    expect(html).toContain('src="sha256-d"')
    expect(html).toContain("--accent:#e8590c")
  })
})

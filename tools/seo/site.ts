/** The typed Site: seo.json joined with the facts that other sources own, built once and read by every renderer. */
import type { Tokens } from "@design/schema"
import type { LinkKind, Seo, SeoLink } from "./schema"

type Mode = "light" | "dark"

export interface Palette {
  paper: string
  ink: string
  ink2: string
  card: string
  onCard: string
  accent: string
  line: string
  grid: string
}

export interface Maker {
  name: string
  url: string
}

export interface HubCopy {
  label: string
  href: string
}

export interface ResolvedLink {
  kind: LinkKind
  label: string
  note: string
  url: string
}

export interface PageEntry {
  path: string
  lastmod: string
}

export interface Instruments {
  live: string[]
  planned: string[]
}

export interface SiteInputs {
  seo: Seo
  product: string
  hub: HubCopy
  homepage: string
  instruments: Instruments
  stages: string[]
  tokens: Tokens
  markPath: string
  pages: PageEntry[]
}

/** The names, facts and lists that come from the other sources. */
export interface Identity {
  seo: Seo
  name: string
  demoName: string
  url: string
  domain: string
  appId: string
  maker: Maker
  instruments: Instruments
  stages: string[]
  markPath: string
}

export interface Palettes {
  light: Palette
  dark: Palette
}

export interface Linked {
  links: ResolvedLink[]
  booking: string
  pages: PageEntry[]
}

export type Site = Identity & Palettes & Linked

type LinkBases = Partial<Record<LinkKind, string>>

export function buildSite(inputs: SiteInputs): Site {
  const maker = makerOf(inputs.hub)
  const links = inputs.seo.links.map(resolveLink.bind(null, { demo: inputs.homepage, maker: maker.url }))
  return { ...identityOf(inputs, maker), ...paletteOf(inputs.tokens), links, booking: urlOfKind(links, "booking"), pages: inputs.pages }
}

function identityOf(inputs: SiteInputs, maker: Maker): Identity {
  const { seo, product, homepage, hub } = inputs
  const names = { name: product, demoName: `${product} demo`, url: homepage, domain: new URL(homepage).host, appId: hub.href }
  return { ...names, seo, maker, instruments: inputs.instruments, stages: inputs.stages, markPath: inputs.markPath }
}

function paletteOf(tokens: Tokens): Palettes {
  return { light: palette(tokens, "light"), dark: palette(tokens, "dark") }
}

/** The maker is the hub: its name and its origin, taken from the hub link the app already shows. */
function makerOf(hub: HubCopy): Maker {
  return { name: hub.label, url: `${new URL(hub.href).origin}/` }
}

function resolveLink(bases: LinkBases, link: SeoLink): ResolvedLink {
  const url = link.url ?? bases[link.kind]
  if (!url) throw new Error(`link ${link.kind} has no url`)
  return { kind: link.kind, label: link.label, note: link.note, url }
}

function urlOfKind(links: ResolvedLink[], kind: LinkKind): string {
  const found = links.find(isKind.bind(null, kind))
  if (!found) throw new Error(`seo.json has no ${kind} link`)
  return found.url
}

function isKind(kind: LinkKind, link: ResolvedLink): boolean {
  return link.kind === kind
}

function palette(tokens: Tokens, mode: Mode): Palette {
  const pick = colorOf.bind(null, tokens, mode)
  return { paper: pick("paper"), ink: pick("ink"), ink2: pick("ink-2"), card: pick("ink-card"), onCard: pick("on-ink"), accent: pick("accent"), line: pick("line"), grid: pick("grid") }
}

function colorOf(tokens: Tokens, mode: Mode, name: string): string {
  const token = tokens["color"]?.[name]
  if (!token) throw new Error(`unknown colour token: ${name}`)
  return mode === "dark" ? (token.dark ?? token.value) : token.value
}

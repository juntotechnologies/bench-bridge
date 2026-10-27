/** Zod schemas for the registries: devices, targets, catalogue and pipeline stages. */
import { z } from "zod"

const Pair = z.tuple([z.string(), z.string()])
const Triple = z.tuple([z.string(), z.string(), z.string()])

export const TargetId = z.enum(["lims", "ledger"])

export const FieldSource = z.union([z.string(), z.object({ const: z.string() })])

const Delivery = z.object({
  target: TargetId,
  fields: z.record(z.string(), FieldSource),
})

/** One entry per protocol; a new instrument family adds a member and a parser. */
export const ParserConfig = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("sics-line"), quantity: z.string() }),
  z.object({ kind: z.literal("peak-table"), unit: z.string(), analyte: z.string().optional(), role: z.string().optional() }),
  z.object({ kind: z.literal("ph-line"), quantity: z.string(), unit: z.string() }),
  z.object({ kind: z.literal("labelled-lines"), labels: z.array(z.string()).min(1) }),
])

export const NormalizeRules = z.object({
  dropUnstable: z.boolean().optional(),
  dropBeforeMinutes: z.number().positive().optional(),
  byDifference: z.object({ quantity: z.string() }).optional(),
  purity: z.object({ quantity: z.string() }).optional(),
  keepLast: z.boolean().optional(),
  keepQuantity: z.string().optional(),
  bestMatch: z.boolean().optional(),
})

export const Capture = z.object({
  startedAt: z.iso.datetime(),
  cadenceMs: z.number().positive(),
  sampleId: z.string(),
  containerRef: z.string().optional(),
  lines: z.array(z.string()).min(1),
})

export const KitExample = z.object({ vendor: z.string(), product: z.string(), note: z.string() })

/** One part of a bridge kit. Examples name real products as labelled examples only. */
export const KitPart = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  job: z.string(),
  why: z.string(),
  examples: z.array(KitExample),
})

export const KitStep = z.object({ title: z.string(), detail: z.string() })

export const Kit = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  summary: z.string(),
  flow: z.array(KitStep).min(1),
  install: z.array(KitStep).min(1),
  parts: z.array(z.string()).min(1),
})

/** Every kit, the library of parts they draw from, and the checks and safeguards that all kits share. */
export const KitFile = z.object({ parts: z.array(KitPart), checks: z.array(KitStep), safeguards: z.array(KitStep), kits: z.array(Kit) })

export const Device = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  model: z.string(),
  era: z.number().int(),
  status: z.enum(["bridged", "pilot", "retrofit"]),
  assetId: z.string(),
  summary: z.string(),
  today: z.array(z.string()),
  bridged: z.array(z.string()),
  /** The ID of a kit in data/kits.json. */
  kit: z.string(),
  specs: z.array(Pair),
  /** Facts about the connection on this instrument, as label and text. */
  connection: z.array(Pair),
  port: z.object({ kind: z.string(), connector: z.string(), settings: z.string(), pins: z.array(Triple) }),
  parser: ParserConfig,
  normalize: NormalizeRules,
  capture: Capture,
  deliveries: z.array(Delivery).min(1),
})

export const Target = z.object({
  label: z.string(),
  record: z.string(),
  endpoint: z.string(),
  refPrefix: z.string(),
  required: z.array(z.string()),
})

/** Every instrument the demo plans to show, ranked by value to a DEA-registered test lab. */
export const CatalogEntry = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  interface: z.string(),
  era: z.string(),
  why: z.string(),
})

export const Stage = z.object({ id: z.string(), label: z.string(), icon: z.string(), detail: z.string() })

export type Device = z.infer<typeof Device>
export type Kit = z.infer<typeof Kit>
export type KitPart = z.infer<typeof KitPart>
export type KitStep = z.infer<typeof KitStep>
export type KitExample = z.infer<typeof KitExample>
export type Target = z.infer<typeof Target>
export type Stage = z.infer<typeof Stage>
export type CatalogEntry = z.infer<typeof CatalogEntry>
export type ParserConfig = z.infer<typeof ParserConfig>
export type NormalizeRules = z.infer<typeof NormalizeRules>
export type Capture = z.infer<typeof Capture>
export type FieldSource = z.infer<typeof FieldSource>
export type TargetId = z.infer<typeof TargetId>

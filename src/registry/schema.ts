import { z } from "zod"

const Pair = z.tuple([z.string(), z.string()])
const Triple = z.tuple([z.string(), z.string(), z.string()])

export const FieldSource = z.union([z.string(), z.object({ const: z.string() })])

const Delivery = z.object({
  target: z.enum(["lims", "inventory", "erp"]),
  fields: z.record(z.string(), FieldSource),
})

const Printout = z.object({
  kind: z.literal("printout"),
  sampleKey: z.string(),
  primary: z.object({ key: z.string(), quantity: z.string(), unit: z.string() }),
  extras: z.record(z.string(), z.string()),
})

const Ratio = z.object({ numerator: z.number(), denominator: z.number(), quantity: z.string() })

export const ParserConfig = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("sics-line"), quantity: z.string() }),
  Printout,
  z.object({ kind: z.literal("gpib-query"), quantity: z.string(), unit: z.string(), ratio: Ratio }),
  z.object({ kind: z.literal("plate-matrix"), quantity: z.string(), unit: z.string() }),
  z.object({ kind: z.literal("event-log"), quantity: z.string(), unit: z.string(), runThresholdA: z.number() }),
  z.object({ kind: z.literal("analog-loop"), quantity: z.string() }),
])

const Scale = z.object({ fromMin: z.number(), fromMax: z.number(), toMin: z.number(), toMax: z.number(), unit: z.string() })

export const NormalizeRules = z.object({
  dropUnstable: z.boolean().optional(),
  scale: Scale.optional(),
  alarmAbove: z.number().optional(),
})

export const Capture = z.object({
  startedAt: z.iso.datetime(),
  cadenceMs: z.number().positive(),
  sampleId: z.string(),
  lines: z.array(z.string()).min(1),
})

export const Device = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  model: z.string(),
  era: z.number().int(),
  domain: z.enum(["chemistry", "biology"]),
  status: z.enum(["bridged", "pilot", "retrofit"]),
  assetId: z.string(),
  summary: z.string(),
  today: z.array(z.string()),
  bridged: z.array(z.string()),
  kit: z.string(),
  specs: z.array(Pair),
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

export const Stage = z.object({ id: z.string(), label: z.string(), icon: z.string(), detail: z.string() })

export type Device = z.infer<typeof Device>
export type Target = z.infer<typeof Target>
export type Stage = z.infer<typeof Stage>
export type ParserConfig = z.infer<typeof ParserConfig>
export type NormalizeRules = z.infer<typeof NormalizeRules>
export type Capture = z.infer<typeof Capture>
export type FieldSource = z.infer<typeof FieldSource>
export type TargetId = Device["deliveries"][number]["target"]

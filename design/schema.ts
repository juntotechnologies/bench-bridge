/** Schemas for the design spec files. Each file is validated once, when it loads. */
import { z } from "zod"

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/

const Token = z.object({ value: z.string(), dark: z.string().optional(), use: z.string(), package: z.string().optional() })
const TokenGroup = z.record(z.string().regex(NAME), Token)

export const Tokens = z.record(z.string().regex(NAME), TokenGroup)
export const Layout = z.record(z.string(), z.object({ value: z.number(), use: z.string() }))
export const Viewports = z.array(z.object({ name: z.string(), width: z.number(), height: z.number() }))
export const Principles = z.array(z.object({ rule: z.string(), why: z.string() }))
/** A pair of colour tokens that must stay readable in both themes. `min` is the least contrast ratio. */
export const Contrast = z.array(z.object({ fg: z.string(), bg: z.string(), min: z.number().positive(), use: z.string() }))
export const Components = z.array(
  z.object({
    name: z.string(),
    selector: z.string(),
    use: z.string(),
    parts: z.array(z.string()),
    states: z.array(z.string()),
    tokens: z.array(z.string()),
    origin: z.string(),
  }),
)

export type Tokens = z.infer<typeof Tokens>
export type Layout = z.infer<typeof Layout>
export type Viewports = z.infer<typeof Viewports>
export type Principles = z.infer<typeof Principles>
export type Components = z.infer<typeof Components>
export type Contrast = z.infer<typeof Contrast>
export type Token = z.infer<typeof Token>

/** Everything the spec holds, after validation. */
export interface Spec {
  tokens: Tokens
  layout: Layout
  viewports: Viewports
  principles: Principles
  components: Components
  contrast: Contrast
}

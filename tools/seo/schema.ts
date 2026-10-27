/** Schema for site/seo.json: the one source of the discovery copy, validated once when it loads. */
import { z } from "zod"

const LINK_KINDS = ["demo", "maker", "source", "booking"] as const

const Page = z.strictObject({ path: z.string().startsWith("/"), sources: z.array(z.string()).min(1) })
const Link = z.strictObject({ kind: z.enum(LINK_KINDS), label: z.string(), note: z.string(), url: z.url().optional() })
const Icon = z.strictObject({ path: z.string(), size: z.number().int().positive() })
const Icons = z.strictObject({ svg: z.string(), touch: Icon, app: z.array(Icon).min(1) })
const Og = z.strictObject({ path: z.string(), width: z.number().int(), height: z.number().int(), alt: z.string() })
const Agents = z.strictObject({ summary: z.string(), may: z.array(z.string()).min(1), mayNot: z.array(z.string()).min(1) })

export const Seo = z.strictObject({
  publicDir: z.string(),
  indexHtml: z.string(),
  language: z.string(),
  locale: z.string(),
  title: z.string().max(60),
  tagline: z.string(),
  headline: z.string(),
  description: z.string().max(160),
  summary: z.string(),
  needsScript: z.string(),
  shows: z.array(z.string()).min(1),
  limits: z.array(z.string()).min(1),
  crawlers: z.array(z.string()).min(1),
  agents: Agents,
  links: z.array(Link).min(1),
  pages: z.array(Page).min(1),
  og: Og,
  icons: Icons,
  manifest: z.string(),
})

export type Seo = z.infer<typeof Seo>
export type SeoPage = z.infer<typeof Page>
export type SeoLink = z.infer<typeof Link>
export type SeoIcon = z.infer<typeof Icon>
export type LinkKind = (typeof LINK_KINDS)[number]

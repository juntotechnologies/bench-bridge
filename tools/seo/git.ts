/** Git dates for the sitemap: the day of the last commit that touched a page source, or today while a source has changes. */
import { execFileSync } from "node:child_process"
import type { SeoPage } from "./schema"
import type { PageEntry } from "./site"

function git(root: string, args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim()
}

function committedDay(root: string, sources: string[]): string {
  return git(root, ["log", "-1", "--format=%cs", "--", ...sources])
}

function hasChanges(root: string, sources: string[]): boolean {
  return git(root, ["status", "--porcelain", "--", ...sources]) !== ""
}

/** A source with changes that are not committed yet gets today's date, which is the date its commit will get. */
export function pickLastmod(committed: string, changed: boolean, today: string): string {
  return changed || committed === "" ? today : committed
}

export function localDay(now: Date): string {
  return now.toLocaleDateString("en-CA")
}

export function pageEntry(root: string, today: string, page: SeoPage): PageEntry {
  const lastmod = pickLastmod(committedDay(root, page.sources), hasChanges(root, page.sources), today)
  return { path: page.path, lastmod }
}

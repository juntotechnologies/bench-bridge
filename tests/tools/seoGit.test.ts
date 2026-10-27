/** Tests for the sitemap date: which day wins, and the local day format. */
import { describe, expect, it } from "vitest"
import { localDay, pickLastmod } from "../../tools/seo/git"

describe("pickLastmod", () => {
  it("uses the commit day when the sources are clean", () => {
    expect(pickLastmod("2026-10-01", false, "2026-10-27")).toBe("2026-10-01")
  })

  it("uses today while a source has uncommitted changes", () => {
    expect(pickLastmod("2026-10-01", true, "2026-10-27")).toBe("2026-10-27")
  })

  it("uses today when no commit touches the sources yet", () => {
    expect(pickLastmod("", false, "2026-10-27")).toBe("2026-10-27")
  })
})

describe("localDay", () => {
  it("formats a local date as year, month and day", () => {
    expect(localDay(new Date(2026, 9, 27, 12))).toBe("2026-10-27")
  })
})

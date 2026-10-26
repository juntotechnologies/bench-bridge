/** Tests for the theme choice: parsing, resolving, toggling and the storage fallback. */
import { describe, expect, it } from "vitest"
import { parseTheme, readTheme, resolvedTheme, toggledTheme, writeTheme, type ThemeStorage } from "@client/ui/theme"

class MemoryStorage implements ThemeStorage {
  private value: string | null = null

  getItem(): string | null {
    return this.value
  }

  setItem(_key: string, value: string): void {
    this.value = value
  }
}

class BrokenStorage implements ThemeStorage {
  getItem(): never {
    throw new Error("blocked")
  }

  setItem(): never {
    throw new Error("blocked")
  }
}

describe("parseTheme", () => {
  it("keeps a known theme", () => {
    expect(parseTheme("dark")).toBe("dark")
    expect(parseTheme("light")).toBe("light")
  })

  it("falls back to the system theme for anything else", () => {
    expect(parseTheme(null)).toBe("system")
    expect(parseTheme("sepia")).toBe("system")
  })
})

describe("resolvedTheme", () => {
  it("follows the system only for the system theme", () => {
    expect(resolvedTheme("system", true)).toBe("dark")
    expect(resolvedTheme("system", false)).toBe("light")
    expect(resolvedTheme("light", true)).toBe("light")
    expect(resolvedTheme("dark", false)).toBe("dark")
  })
})

describe("toggledTheme", () => {
  it("picks the opposite of the theme on screen", () => {
    expect(toggledTheme("system", true)).toBe("light")
    expect(toggledTheme("system", false)).toBe("dark")
    expect(toggledTheme("dark", false)).toBe("light")
    expect(toggledTheme("light", true)).toBe("dark")
  })
})

describe("theme storage", () => {
  it("round-trips the choice", () => {
    const storage = new MemoryStorage()
    writeTheme(storage, "dark")
    expect(readTheme(storage)).toBe("dark")
  })

  it("reads the system theme when nothing is stored", () => {
    expect(readTheme(new MemoryStorage())).toBe("system")
  })

  it("survives a blocked store", () => {
    expect(readTheme(new BrokenStorage())).toBe("system")
    expect(() => writeTheme(new BrokenStorage(), "dark")).not.toThrow()
  })
})

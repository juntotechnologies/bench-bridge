/** The colour theme: the stored choice, the theme on screen, and the root attribute that selects the dark tokens. */
import { logEvent } from "@shared/log"
import type { AppState, Store } from "./store"

export const THEMES = ["system", "light", "dark"] as const
export type Theme = (typeof THEMES)[number]
export type Resolved = "light" | "dark"

const STORAGE_KEY = "bench-bridge.theme"

/** The part of Storage this module uses, so a test can pass a fake. */
export interface ThemeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function parseTheme(raw: string | null): Theme {
  return THEMES.find(isRaw.bind(null, raw)) ?? "system"
}

function isRaw(raw: string | null, theme: Theme): boolean {
  return theme === raw
}

export function resolvedTheme(theme: Theme, systemDark: boolean): Resolved {
  if (theme === "system") return systemDark ? "dark" : "light"
  return theme
}

/** The choice a click makes: the opposite of what the reader sees now. */
export function toggledTheme(theme: Theme, systemDark: boolean): Resolved {
  return resolvedTheme(theme, systemDark) === "dark" ? "light" : "dark"
}

function noItem(): null {
  return null
}

function dropItem(): void {}

/** A store that keeps nothing, for a browser that blocks local storage. */
const NO_STORAGE: ThemeStorage = { getItem: noItem, setItem: dropItem }

/** Local storage of this page. A browser that blocks it throws on access, so the choice then lives for one visit. */
export function browserStorage(): ThemeStorage {
  try {
    return window.localStorage
  } catch (error) {
    logEvent("theme.storage_blocked", { message: String(error) }, "warn")
    return NO_STORAGE
  }
}

export function readTheme(storage: ThemeStorage): Theme {
  try {
    return parseTheme(storage.getItem(STORAGE_KEY))
  } catch (error) {
    logEvent("theme.read_failed", { message: String(error) }, "warn")
    return "system"
  }
}

export function writeTheme(storage: ThemeStorage, theme: Theme): void {
  try {
    storage.setItem(STORAGE_KEY, theme)
  } catch (error) {
    logEvent("theme.write_failed", { message: String(error) }, "warn")
  }
}

/** What the page needs to follow the theme: the root element, the store of choices and the system query. */
export interface ThemeEnv {
  root: HTMLElement
  storage: ThemeStorage
  media: MediaQueryList
}

/** Sets or clears the root attribute. With no attribute, the stylesheet follows the system. */
export function applyTheme(root: HTMLElement, theme: Theme): void {
  if (theme === "system") delete root.dataset.theme
  else root.dataset.theme = theme
}

function persist(env: ThemeEnv, state: AppState, previous: AppState): void {
  if (state.theme === previous.theme) return
  applyTheme(env.root, state.theme)
  writeTheme(env.storage, state.theme)
}

/** Applies the stored choice now, and applies and stores each later change. */
export function bindTheme(env: ThemeEnv, store: Store): void {
  store.subscribe(persist.bind(null, env))
  applyTheme(env.root, store.get().theme)
}

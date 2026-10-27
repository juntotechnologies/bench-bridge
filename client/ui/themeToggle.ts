/** The header button that flips the theme on screen. It shows the icon of the theme it switches to. */
import { copy } from "@shared/registry"
import { h, svg } from "./dom"
import { icon } from "./icons"
import { resolvedTheme, toggledTheme, type ThemeEnv } from "./theme"
import type { AppState, Store } from "./store"

function flip(env: ThemeEnv, store: Store): void {
  store.set({ theme: toggledTheme(store.get().theme, env.media.matches) })
}

function sync(env: ThemeEnv, button: HTMLElement, state: AppState): void {
  const onScreen = resolvedTheme(state.theme, env.media.matches)
  const label = onScreen === "dark" ? copy.theme.toLight : copy.theme.toDark
  button.replaceChildren(svg(icon(onScreen === "dark" ? "sun" : "moon", 18)))
  button.setAttribute("aria-label", label)
  button.title = label
}

function resync(env: ThemeEnv, store: Store, button: HTMLElement): void {
  sync(env, button, store.get())
}

export function themeToggle(env: ThemeEnv, store: Store): HTMLElement {
  const button = h("button", { class: "theme-toggle", attrs: { type: "button", "data-glow": true }, on: { click: flip.bind(null, env, store) } })
  store.subscribe(sync.bind(null, env, button))
  env.media.addEventListener("change", resync.bind(null, env, store, button))
  sync(env, button, store.get())
  return button
}

/** Copies text to the clipboard. Where the page is not a secure context (plain HTTP), it selects a hidden text area instead. */
import { logEvent } from "@shared/log"
import { h } from "./dom"

export interface ClipboardEnv {
  writeText: ((text: string) => Promise<void>) | null
  legacyCopy: (text: string) => boolean
}

export async function copyText(env: ClipboardEnv, text: string): Promise<boolean> {
  const modern = env.writeText ? await attempt(env.writeText, text) : false
  return modern || env.legacyCopy(text)
}

async function attempt(write: (text: string) => Promise<void>, text: string): Promise<boolean> {
  try {
    await write(text)
    return true
  } catch (error) {
    logEvent("clipboard.refused", { message: String(error) }, "warn")
    return false
  }
}

/** The clipboard of this page: the modern one only in a secure context. */
export function browserClipboard(): ClipboardEnv {
  const modern = window.isSecureContext ? navigator.clipboard : undefined
  return { writeText: modern ? modern.writeText.bind(modern) : null, legacyCopy: copyBySelection }
}

function copyBySelection(text: string): boolean {
  const area = h("textarea", { class: "offscreen", attrs: { readonly: true, "aria-hidden": true } }, [text])
  document.body.append(area)
  area.select()
  const copied = document.execCommand("copy")
  area.remove()
  return copied
}

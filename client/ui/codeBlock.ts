/** A code block: line numbers, coloured JSON and a copy button that confirms in place. */
import { copy } from "@shared/registry"
import { logEvent } from "@shared/log"
import { h, svg } from "./dom"
import { browserClipboard, copyText } from "./clipboard"
import { icon } from "./icons"
import { tokenizeJson, type Token } from "./highlight"

export interface CodeSpec {
  label: string
  text: string
}

export function codeBlock(spec: CodeSpec): HTMLElement {
  const lines = spec.text.split("\n").map(codeLine)
  return h("figure", { class: "code" }, [
    h("figcaption", {}, [h("span", {}, [spec.label]), copyButton(spec.text)]),
    h("ol", {}, lines),
  ])
}

function codeLine(line: string): HTMLElement {
  return h("li", {}, [h("span", { class: "code-text" }, tokenizeJson(line).map(tokenNode))])
}

function tokenNode(token: Token): HTMLElement {
  return h("span", { class: `tok-${token.kind}` }, [token.text])
}

function copyButton(text: string): HTMLElement {
  const label = [svg(icon("copy", 13)), h("span", { class: "copy-idle" }, [copy.code.copy]), h("span", { class: "copy-done" }, [copy.code.copied])]
  const on = { click: copyClicked.bind(null, text), animationend: clearCopied }
  return h("button", { class: "code-copy", attrs: { type: "button", "aria-label": copy.code.copy }, on }, label)
}

async function copyClicked(text: string, event: Event): Promise<void> {
  const button = event.currentTarget as HTMLElement
  if (await copyText(browserClipboard(), text)) button.classList.add("is-copied")
  else logEvent("clipboard.failed", {}, "warn")
}

function clearCopied(event: Event): void {
  const button = event.currentTarget as HTMLElement
  button.classList.remove("is-copied")
}

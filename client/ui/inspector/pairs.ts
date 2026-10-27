/** A definition list from label and text pairs, used for specs and connection facts. */
import { h } from "../dom"

export type LabelledText = [string, string]

export function pairList(pairs: LabelledText[]): HTMLElement {
  return h("dl", { class: "specs" }, pairs.flatMap(pairRow))
}

function pairRow([label, value]: LabelledText): HTMLElement[] {
  return [h("dt", {}, [label]), h("dd", {}, [value])]
}

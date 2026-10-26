/** Tiny typed DOM helpers: element builder, inline SVG and child replacement. */
export type Child = Node | string | number | null | false | undefined

export interface Props {
  class?: string
  attrs?: Record<string, string | number | boolean>
  on?: Partial<Record<keyof HTMLElementEventMap, EventListener>>
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  applyProps(element, props)
  element.append(...children.filter(isPresent).map(toNode))
  return element
}

function applyProps(element: HTMLElement, props: Props): void {
  if (props.class) element.className = props.class
  applyAttrs(element, props.attrs ?? {})
  applyListeners(element, props.on ?? {})
}

function applyAttrs(element: HTMLElement, attrs: NonNullable<Props["attrs"]>): void {
  for (const [name, value] of Object.entries(attrs)) setAttr(element, name, value)
}

function applyListeners(element: HTMLElement, listeners: NonNullable<Props["on"]>): void {
  for (const [name, listener] of Object.entries(listeners)) element.addEventListener(name, listener)
}

/** Inline SVG from trusted generator output: our own icons and drawings. */
export function svg(markup: string, className = ""): HTMLSpanElement {
  const holder = document.createElement("span")
  holder.className = className
  holder.innerHTML = markup
  return holder
}

const SVG_NS = "http://www.w3.org/2000/svg"

export type SvgAttrs = Record<string, string | number>

/** An SVG element built node by node, for data that is not trusted. Never goes through innerHTML. */
export function s(tag: string, attrs: SvgAttrs = {}, children: Child[] = []): SVGElement {
  const element = document.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value))
  element.append(...children.filter(isPresent).map(toNode))
  return element
}

export function replace(container: Element, ...children: Child[]): void {
  container.replaceChildren(...children.filter(isPresent).map(toNode))
}

function setAttr(element: Element, name: string, value: string | number | boolean): void {
  if (value === false) return
  element.setAttribute(name, value === true ? "" : String(value))
}

function isPresent(child: Child): child is Node | string | number {
  return child !== null && child !== false && child !== undefined
}

function toNode(child: Node | string | number): Node | string {
  return typeof child === "number" ? String(child) : child
}

/** Pointer light: writes the pointer position onto the card under the pointer, so the stylesheet can draw a light there. */

/** The light shows only for a pointer that can hover, and never when the user asks for reduced motion. The stylesheet repeats this query. */
export const LIGHT_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"

/** The attribute a card carries to glow. The stylesheet and design/components.json name the same selector. */
export const CARD_SELECTOR = "[data-glow]"

export interface Corner {
  left: number
  top: number
}

export interface Pointer {
  x: number
  y: number
}

export interface LightPosition {
  x: string
  y: string
}

/** The pointer offset from the corner of its card, as the two custom property values the stylesheet reads. */
export function lightPosition(corner: Corner, pointer: Pointer): LightPosition {
  return { x: `${Math.round(pointer.x - corner.left)}px`, y: `${Math.round(pointer.y - corner.top)}px` }
}

/** The card the pointer is over, or null when it is over nothing that glows. */
function cardUnder(event: PointerEvent): HTMLElement | null {
  return event.target instanceof Element ? event.target.closest<HTMLElement>(CARD_SELECTOR) : null
}

function paint(card: HTMLElement, event: PointerEvent): void {
  const position = lightPosition(card.getBoundingClientRect(), { x: event.clientX, y: event.clientY })
  card.style.setProperty("--glow-x", position.x)
  card.style.setProperty("--glow-y", position.y)
}

function onMove(media: MediaQueryList, event: PointerEvent): void {
  const card = media.matches ? cardUnder(event) : null
  if (card) paint(card, event)
}

/** One listener for the whole page. A card opts in with the attribute `data-glow`. */
export function bindPointerLight(root: HTMLElement, media: MediaQueryList): void {
  root.addEventListener("pointermove", onMove.bind(null, media))
}

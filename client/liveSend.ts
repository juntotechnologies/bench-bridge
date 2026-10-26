/** The live transport: the browser's own fetch, which reaches the dev server API. The static site swaps this file. */
import type { Send } from "./api"

export const send: Send = fetch.bind(globalThis)

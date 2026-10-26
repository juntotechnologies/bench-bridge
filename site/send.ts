/** The static site transport: replaces client/liveSend.ts at build time, so delivery runs in the browser. */
import { createStaticSend } from "@server/staticSend"

export const send = createStaticSend()

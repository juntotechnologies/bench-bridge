# site/

The GitHub Pages build: the client app with its delivery API running inside the browser.

## Domain
- Pages serves static files only. The dev server cannot run there.
- `send.ts` replaces `../client/liveSend.ts` at build time. It answers the deliver request with the server handler.
- The ledger resets on each page load. The browser keeps no state.
- The site URL is `homepage` in `../package.json`. The build path comes from the same field.

## Rules
- Keep app code out of this directory. It only wires the client to the server.
- Run `npm run build:pages` before a push. `npm run check` runs it.

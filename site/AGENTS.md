# site/

The GitHub Pages build: the client app with its delivery API running inside the browser.

## Domain
- Pages serves static files only. The dev server cannot run there.
- `send.ts` replaces `../client/liveSend.ts` at build time. It answers the deliver request with the server handler.
- The ledger resets on each page load. The browser keeps no state.
- The site URL is `homepage` in `../package.json`. The build path comes from the same field.
- `seo.json` is the source of the discovery copy. `../tools/seo/` turns it into `public/` and the tags in `../client/index.html`.
- Vite copies `public/` to the site root, so `robots.txt` and `llms.txt` sit next to the page.
- `dropNotes.ts` removes the `AGENTS.md` that the copy brings along. The site must not serve it.

## Rules
- Keep app code out of this directory. It only wires the client to the server.
- Run `npm run build:pages` before a push. `npm run check` runs it.
- Edit `seo.json`, then run `npm run seo`. Never edit `public/` by hand.

## Files

<!-- gen:files site -->
| File | Holds |
| ---- | ----- |
| `dropNotes.ts` | Vite plugin: removes AGENTS.md from the build output |
| `public/` | Generated public files that the build copies to the site root |
| `send.ts` | Answers the deliver request in the browser with the server handler |
| `seo.json` | The source of the discovery copy: title, description, summary, crawlers, agent rules and links |
| `vite.config.ts` | Vite config for the Pages build |
<!-- /gen -->

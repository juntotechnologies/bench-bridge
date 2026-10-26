# client/

The browser app: the UI, the drawings and the web worker.

## Domain
- The look follows drafting paper: cream sheet, grid, fine ink lines, mono labels, one orange accent.
- Drawings are concept drawings from the vendored teardown skill. They are not dimensioned.
- The orange part in every drawing is the bridge tap.
- The page never scrolls. The app fills the window. A panel may scroll inside itself.
- Narrow windows show one pane at a time: Instruments, Drawing or Details. The pane switch sits in the dock at the bottom.

## Rules
- Import `shared` as `@shared/*`. Never import `server`. Lint enforces this.
- Reach the server only through `api.ts`.
- Keep each breakpoint in `layout.json`. CSS cannot import it, so a test fails when `styles.css` drifts from it.
- Run `npm run fit` after any layout change. It fails when the page scrolls or a region is clipped at any listed window size.
- Use no Node modules in app code. `scripts/` and `vite.config.ts` may use them.
- Use `crypto.getRandomValues`, never `randomUUID`: the demo runs over plain HTTP.
- Run browser checks at the tailnet link, not only at localhost.

# client/

The browser app: the UI, the drawings and the web worker.

## Domain
- The look follows drafting paper: cream sheet, grid, fine ink lines, mono labels, one orange accent.
- Drawings are concept drawings from the vendored teardown skill. They are not dimensioned.
- The orange part in every drawing is the bridge tap.

## Rules
- Import `shared` as `@shared/*`. Never import `server`. Lint enforces this.
- Reach the server only through `api.ts`.
- Use no Node modules in app code. `scripts/` and `vite.config.ts` may use them.
- Use `crypto.getRandomValues`, never `randomUUID`: the demo runs over plain HTTP.
- Run browser checks at the tailnet link, not only at localhost.

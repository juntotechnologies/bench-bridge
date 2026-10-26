# client/ui/

The DOM UI: five regions, one store.

## Rules
- All state lives in `store.ts`. A region reads the store and writes only through `store.set`.
- Build elements with `dom.ts`. Never concatenate HTML from data. Only trusted drawing and icon SVG may use `innerHTML`.
- Build a control once and update it in place. Do not rebuild it on each state change.
- UI text comes from `copy` in the registry. Do not write it inline.
- Pass dependencies in (`RunDeps`). Do not reach for globals.

# client/drawings/

Draws each instrument as an exploded technical drawing.

## Domain
- The engine is the vendored teardown skill at `.agents/skills/teardown/` (MIT). Do not edit it.
- Rendering runs in a web worker. The client caches each drawing by device, spacing and labels.
- Labels draw only at rest (spacing 0 or 1).

## Rules
- Only `engine.ts` touches the engine globals.
- Add a drawing: write a model in `models/`, register it by device ID, then run `npm run proof` and look at the result.

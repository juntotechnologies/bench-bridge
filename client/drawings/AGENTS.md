# client/drawings/

Draws each instrument, and each bridge kit, as an exploded technical drawing.

## Domain
- The engine is the vendored teardown skill at `.agents/skills/teardown/` (MIT). Do not edit it.
- Rendering runs in a web worker. The client caches each drawing by drawing ID, spacing and labels.
- A drawing ID is a device ID, or `kit:` and a kit ID (`ids.ts`). The Kit tab shows the kit drawing.
- Labels draw only at rest (spacing 0 or 1).

## Rules
- Only `engine.ts` touches the engine globals.
- Add a drawing: write a model in `models/`, register it by device ID, then run `npm run proof` and look at the result.
- Add a kit drawing in `kits/`. `npm run drawings` checks every kit part and every instrument.
- The engine does not load under the test runner. Check drawings with `npm run drawings`, not with a unit test.

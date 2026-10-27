# client/drawings/kits/

One drawing for each bridge kit, built from part builders.

## Domain
- Part IDs, names and kit lists come from `shared/data/kits.json`. This directory holds only the shape of each part.
- All kits share one case. A kit differs by its connector (`outlines.ts`) and its tap board (`taps.ts`).
- `layout.ts` holds the sizes and the lift of each part. Every part explodes along one axis, so labels stay clear.

## Rules
- A part builder takes a `PartContext` and returns one `Part`. It must set the part ID that `shared/data/kits.json` lists.
- A new part needs a builder in `models.ts`. `npm run drawings` fails when the builders and the registry differ.
- Run `npm run proof -- "kit:<id>"` and look at the result for every kit that you change.
- A part is pure. It reads no state and draws nothing.

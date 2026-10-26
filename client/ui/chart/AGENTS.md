# client/ui/chart/

Live charts for the Data tab: a chromatogram for peak reports, a weight trace for balances.

## Domain
- A chart is a typed `Chart` model. A builder makes it from a `BridgeRun`. `render.ts` draws it as SVG.
- The model holds data units. `render.ts` maps them to pixels.
- Scales are linear and the y axis of a chromatogram starts at zero. Small peaks stay small.
- Colour carries state only: accent for the main peak, ink for kept readings, gray for dropped readings. Text uses text tokens.

## Rules
- Build SVG with `s()` from `../dom`. Never use `innerHTML`: peak names come from instrument output.
- Add a chart kind: write a builder, register it in `model.ts`, then add a test in `tests/client/chart/`.
- Take every colour, radius and timing from `design/tokens.json`.

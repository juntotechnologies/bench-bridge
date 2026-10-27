# client/scripts/

Node scripts for the client. They may import Node modules.

## Rules
- `proof-drawings.ts` renders every device and every kit. It must fail when a model is missing.
- `check-drawings.ts` draws every device and kit under Node. It fails when a kit part, a builder or a drawing is missing.
- Keep each script a short `main` that calls named functions.
- `check-fit.ts` opens the built site at each size in `fit.json` and walks every live device at each size. Add a window size in `../../design/viewports.json`, not in the script.
- `check-fit.ts` opens the kit from the stage switch, picks a part, and returns. `check-fit.ts` also fails when another element covers a control, and when Assembled or Exploded does not move the spacing slider. Add a control to `tappable` in `fit.json`.
- Both `check-fit.ts` and `capture-media.ts` serve the built site through `staticSite.ts`.
- `layoutProbe.ts` measures the open page. `layoutBudget.ts` judges the measures. Set the limits in the `layout` block of `fit.json`.
- Under the compact width, every control in `tappable` must be at least the `touch` token wide and tall. The check fails otherwise.
- Buttons of one row in `layout.rows` must share one width. A frame in `layout.frames` must have equal side margins. A heading in `layout.headings` runs to two lines at most.
- Add a child that can leave its parent to `contained` in `fit.json`. A region check misses a child that overflows a box that still fits.
- `lightWalk.ts` moves the mouse over the card named by `lightSelector` in `fit.json`. It fails when the pointer light does not follow.

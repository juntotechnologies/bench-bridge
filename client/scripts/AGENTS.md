# client/scripts/

Node scripts for the client. They may import Node modules.

## Rules
- `proof-drawings.ts` renders every device. It must fail when a device has no model.
- Keep each script a short `main` that calls named functions.
- `check-fit.ts` opens the built site at each size in `fit.json` and walks every live device at each size. Add a window size in `../../design/viewports.json`, not in the script.
- `check-fit.ts` also fails when another element covers a control, and when Assembled or Exploded does not move the spacing slider. Add a control to `tappable` in `fit.json`.
- Both `check-fit.ts` and `capture-media.ts` serve the built site through `staticSite.ts`.

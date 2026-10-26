# client/scripts/

Node scripts for the client. They may import Node modules.

## Rules
- `proof-drawings.ts` renders every device. It must fail when a device has no model.
- Keep each script a short `main` that calls named functions.
- `check-fit.ts` opens the built site at each size in `fit.json`. Add a size there, not in the script.
- Both `check-fit.ts` and `capture-media.ts` serve the built site through `staticSite.ts`.

# client/ui/inspector/

The right-hand panel. One file per tab.

## Rules
- A tab is a function `(device, state, store) => Child[]`. Register it in `index.ts`. A tab that only reads takes fewer arguments.
- The panel re-renders only when the device, tab, run, stage, delivery or picked part changes. This keeps the terminal animation from restarting.
- Show server data (receipts, ledger line) only from `state.delivery`.

# client/ui/inspector/

The right-hand panel. One file per tab.

## Rules
- A tab is a function `(device, state) => Child[]`. Register it in `index.ts`.
- The panel re-renders only when the device, tab, run, stage or delivery changes. This keeps the terminal animation from restarting.
- Show server data (receipts, ledger line) only from `state.delivery`.

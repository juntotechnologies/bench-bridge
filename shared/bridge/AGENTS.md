# shared/bridge/

The pure pipeline: capture, parse, normalize, map. Delivery belongs to the server.

## Domain
- Weigh by difference: the first stable weight less the last stable weight is the amount used.
- Unstable weights (flag D) are dropped. Stable weights (flag S) are kept.
- Round masses to 4 places.

## Rules
- One job per function. A new rule is a new function, not a branch.
- Pure only: no clock, no random, no `console`. Lint enforces this.
- Pass data as the types in `types.ts`. Wire shapes come from `../contracts.ts`.

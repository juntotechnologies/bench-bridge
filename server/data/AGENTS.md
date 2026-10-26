# server/data/

Data the server owns.

| File | Holds |
|------|-------|
| ledger.json | Controlled-substance containers and their opening balances |
| dev.json | The dev server port |

## Rules
- Only `containers.ts` reads `ledger.json`. Only `dev.ts` and `health.ts` read `dev.json`.
- Container values are sample data.

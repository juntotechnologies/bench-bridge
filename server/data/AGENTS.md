# server/data/

Data the server owns.

<!-- gen:files server/data -->
| File | Holds |
| ---- | ----- |
| `dev.json` | The dev server port |
| `ledger.json` | Controlled-substance containers and their opening balances |
<!-- /gen -->

## Rules
- Only `../containers.ts` reads `ledger.json`. Only `../dev.ts` and `../health.ts` read `dev.json`.
- Container values are sample data.

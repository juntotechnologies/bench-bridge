# Bench Bridge

Demo that connects older lab instruments to a LIMS and a controlled-substance (CS) ledger.
One live instrument: the analytical balance. Ten more are planned in `shared/data/catalog.json`.

## Layout

| Directory | Holds |
|-----------|-------|
| `shared/` | Registry JSON, schemas, the pure bridge pipeline, the client-server contracts |
| `client/` | The browser app: UI, drawings, web worker |
| `server/` | The delivery API (mock LIMS and CS ledger) and the dev server |
| `tests/` | All tests, mirroring the areas |
| `tools/` | Lint rules and repo checks |
| `docs/` | Documentation, including the demo video script |

Every directory has an `AGENTS.md` with its domain knowledge and rules.

## Commands

| Command | Does |
|---------|------|
| `npm run dev` | Starts the app and prints the one tailnet link |
| `npm run health` | Checks that the dev server answers |
| `npm run check` | Typecheck, lint, test and build |
| `npm run proof` | Renders every device drawing to `proof/` |

## Notes

- The demo uses sample data. It makes no claim of Part 11 compliance.
- Drawings use the vendored `/teardown` skill (MIT) in `.agents/skills/teardown/`.

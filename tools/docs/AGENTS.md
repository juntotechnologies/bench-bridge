# tools/docs/

Keeps the docs true: fills generated blocks from their sources and checks what a doc names.

## Domain
- A generated block is an HTML comment pair: an opening comment `gen:NAME ARG` and a closing comment `/gen`. `npm run docs` fills it. `npm run lint` fails when it is stale.
- A fact is computed by running the real pipeline and the server handler. It is never typed by hand.
- A doc may name only npm scripts and files that exist. A rename fails lint until the doc is fixed.
- Every initialism has one entry in `glossary.json`. A doc in `spellOutDocs` must show each one as "expansion (KEY)" on every use, even a repeat. Use a term block for prose and a spoken block for a fact.
- `../../code-shape.json` holds two doc lists. `spellOutDocs` names the docs that must spell out initialisms. `docsCheckIgnore` names the docs that the reference check skips.

## Generators

<!-- gen:generators -->
| Block | Argument | Fills |
| ----- | -------- | ----- |
| `catalog` | None | The instrument catalogue and each status |
| `dirs` | None | A table of the top-level directories, from each `AGENTS.md` |
| `fact` | A fact key, such as `balance.run.used` | One value from `facts.ts` |
| `files` | A directory | A table of its entries, with notes from `notes.json` |
| `generators` | None | This table |
| `glossary` | None | A table of every initialism and its meaning |
| `scripts` | None | A table of the npm scripts, with notes from `notes.json` |
| `spoken` | A fact key | One value with its initialisms spelled out |
| `term` | An initialism, then optionally `capitalize` | The expansion and the initialism in parentheses |
<!-- /gen -->

## Files

<!-- gen:files tools/docs -->
| File | Holds |
| ---- | ----- |
| `facts.ts` | Computes demo figures by running the real pipeline and server handler |
| `glossary.json` | Every initialism: its expansion and its meaning |
| `glossary.ts` | Spells initialisms out and finds bare ones in a doc |
| `markers.ts` | Finds generated blocks in markdown and fills them from renderers |
| `notes.json` | Descriptions for files and npm scripts, shown in generated tables |
| `notes.ts` | Schema and stale-note check for notes.json |
| `references.ts` | Finds npm scripts and file paths that a doc names |
| `renderers.ts` | One renderer per generated block name |
| `sync.ts` | Script: writes or checks every generated block |
<!-- /gen -->

## Rules
- Add a generator as a renderer in `renderers.ts` and one row in its table above.
- A new fact is one more entry in `facts.ts`. Per-device facts are prefixed with the device ID.
- A new data file or script needs a note in `notes.json`. Lint fails without one.
- Keep each renderer pure. Only `sync.ts` reads or writes files.

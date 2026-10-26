# tools/docs/

Keeps the docs true: fills generated blocks from their sources and checks what a doc names.

## Domain
- A generated block is an HTML comment pair: an opening comment `gen:NAME ARG` and a closing comment `/gen`. `npm run docs` fills it. `npm run lint` fails when it is stale.
- A fact is computed by running the real pipeline and the server handler. It is never typed by hand.
- A doc may name only npm scripts and files that exist. A rename fails lint until the doc is fixed.
- `docsCheckIgnore` in `../../code-shape.json` lists docs that the reference check skips.

## Generators

| Block | Arg | Fills |
|-------|-----|-------|
| `fact` | key, such as `balance.run.used` | One value from `facts.ts` |
| `files` | a directory | A table of its entries, with notes from `notes.json` |
| `dirs` | none | A table of the top-level directories, from each `AGENTS.md` |
| `scripts` | none | A table of the npm scripts, with notes from `notes.json` |
| `catalog` | none | The instrument catalogue and each status |

## Files

<!-- gen:files tools/docs -->
| File | Holds |
| ---- | ----- |
| `facts.ts` | Computes demo figures by running the real pipeline and server handler |
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

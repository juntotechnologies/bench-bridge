# Bench Bridge

Demo that connects older lab instruments to a LIMS and a controlled-substance (CS) ledger.
Live today: <!-- gen:fact catalog.liveNames -->Analytical balance, HPLC system, and pH meter<!-- /gen -->. <!-- gen:fact catalog.planned -->10<!-- /gen --> more instruments are planned.
The demo has no database. The ledger is stateless: every run starts from the same opening balance.

Live demo: <!-- gen:fact site.url -->https://bench-bridge.juntotechnologies.com/<!-- /gen -->
The live demo runs the delivery API in the browser. The ledger resets on each page load.

![Bench Bridge after a run: the balance drawing, the LIMS receipt and the ledger line](docs/media/screenshot.png)

![Bench Bridge run: capture, parse, normalize, map, deliver](docs/media/demo.gif)

Make the pictures again with `npm run media`.

## Layout

<!-- gen:dirs -->
| Directory | Holds |
| --------- | ----- |
| `client/` | The browser app: the UI, the drawings and the web worker. |
| `design/` | The design spec: one source for the look of the app. Copy this directory to reuse the look in another project. |
| `docs/` | Documentation for people. |
| `server/` | The delivery API: mock LIMS and CS ledger endpoints, and the dev server. |
| `shared/` | Code and data that both client and server use. It holds no UI, no network and no server code. |
| `site/` | The GitHub Pages build: the client app with its delivery API running inside the browser. |
| `tests/` | All tests live here. The directory mirrors the code areas. |
| `tools/` | Repo tooling that enforces the rules. |
<!-- /gen -->

Every directory has an `AGENTS.md` with its domain knowledge and rules.

## Commands

<!-- gen:scripts -->
| Command | Does |
| ------- | ---- |
| `npm run dev` | Starts the app and the API, and prints the one tailnet link |
| `npm run build` | Typechecks, then builds the client into dist/ |
| `npm run build:pages` | Builds the static site for GitHub Pages, with the delivery API in the browser |
| `npm run typecheck` | Typechecks all areas |
| `npm run lint` | ESLint, the AGENTS.md check and the docs check |
| `npm run test` | Runs all tests in tests/ |
| `npm run proof` | Renders every instrument and kit drawing to proof/ |
| `npm run drawings` | Draws every instrument and kit under Node, and fails when a part or a builder is missing |
| `npm run health` | Checks that the dev server answers |
| `npm run check` | Typecheck, lint, test, check the drawings, build and build the static site |
| `npm run docs` | Rewrites every generated block from its source |
| `npm run media` | Builds the static site, records it, and writes the README screenshot and GIF |
| `npm run fit` | Builds the static site, opens it at nine window sizes, and fails when the page scrolls or a region is clipped |
| `npm run design` | Writes design/tokens.css, SPEC.md and spec.lock from the JSON sources |
<!-- /gen -->

## Instruments

<!-- gen:catalog -->
| # | Instrument | Interface | Era | Status | Why it matters |
| --- | ---------- | --------- | --- | ------ | -------------- |
| 1 | Analytical balance | RS-232 print | 1990s | Bridged | Every controlled-substance weigh-out must match the CS ledger. |
| 2 | HPLC system | LAN / GPIB, legacy CDS | 2000s | Bridged | Assay and purity results. CDS and OS updates drop old instrument drivers. |
| 3 | GC system | LAN, legacy CDS | 2000s | Planned | Residual solvent and purity results. CDS and OS updates drop old instrument drivers. |
| 4 | GC-MS | GPIB, legacy CDS | 1990s | Planned | Identity tests for controlled substances. |
| 5 | pH meter | RS-232 print | 2000s | Bridged | pH results for buffers and solutions are copied from the display. |
| 6 | Karl Fischer titrator | RS-232 print | 2000s | Planned | Water content results are typed in from a strip printer. |
| 7 | LC-MS/MS | LAN, vendor export files | 2000s | Planned | Potency and trace results sit in vendor files the LIMS cannot read. |
| 8 | Headspace GC | GPIB / RS-232 | 1990s | Planned | Residual solvent results for release testing. |
| 9 | Dissolution tester | Parallel printer port | 1990s | Planned | Release results print on paper strips. |
| 10 | FTIR spectrometer | Serial, floppy export | 1990s | Planned | Identity tests on incoming controlled-substance lots. |
| 11 | UV-Vis spectrophotometer | GPIB | 1990s | Planned | Assay and identity results need an old PC with a GPIB card. |
| 12 | Stability chamber | 4–20 mA, chart recorder | 1990s | Planned | Storage condition records for stability studies are on paper charts. |
| 13 | CS vault and safe | Door contact, keypad log | 2000s | Planned | Access to controlled-substance storage must be logged. |
<!-- /gen -->

## Notes

- The demo uses sample data. It makes no claim of Part 11 compliance.
- Drawings use the vendored `/teardown` skill (MIT) in `.agents/skills/teardown/`.
- Every figure, count, file list and command table in the docs is generated. Run `npm run docs` after a change.

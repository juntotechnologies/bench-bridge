# design/

The design spec: one source for the look of the app. Copy this directory to reuse the look in another project.

<!-- gen:files design -->
| File | Holds |
| ---- | ----- |
| `SPEC.md` | Generated readable spec |
| `THIRD_PARTY.md` | Licence notice for patterns adapted from Beautiful UI |
| `build.ts` | Script: writes the generated files, or checks them with --check |
| `check.ts` | Checks that token names are unique, components name real tokens, every colour has a dark value and every pair is readable |
| `components.json` | One recipe for each UI component: selector, parts, states and tokens |
| `contrast.json` | The colour pairs that must stay readable in both themes, with the least contrast ratio of each |
| `contrast.ts` | Computes contrast ratios and finds colour pairs that are too faint in a theme |
| `css.ts` | Turns the tokens into CSS custom properties, for the light and the dark theme |
| `files.ts` | Reads the spec sources and writes or compares the generated files |
| `layout.json` | Breakpoints and the compact drawing zoom |
| `lock.ts` | Hashes the sources into spec.lock |
| `principles.json` | The rules about the look that tokens cannot state |
| `schema.ts` | Schemas that validate the spec files |
| `spec.lock` | Generated hash of the sources, for detecting edits in a copy |
| `spec.ts` | Renders SPEC.md from the sources |
| `tokens.css` | Generated CSS custom properties |
| `tokens.json` | The source for every colour, font, radius, shadow and timing, with a dark value for each colour and shadow |
| `viewports.json` | The window sizes the fit check opens |
<!-- /gen -->

## Rules
- Edit the JSON files only. Never edit `tokens.css`, `SPEC.md` or `spec.lock`. Run `npm run design` after a change.
- Write no raw colour, radius, shadow or timing in a stylesheet. Use a token. A test fails on a raw value.
- Add a component to `components.json` when you add a style for it. A test fails when its selector has no style.
- Read `SPEC.md` for the principles, the tokens, the layout sizes and the components.

## Copy to another project
1. Copy `design/` and `tests/design/spec.test.ts`.
2. Add the alias `@design` to `tsconfig.json`, the Vite config and the Vitest config.
3. Add the scripts `design` (`tsx design/build.ts`) and add `tsx design/build.ts --check` to `lint`.
4. Import the file `design/tokens.css` before the app stylesheet, through the alias. Install the font packages named in `SPEC.md`.
5. Run `npm run design`, then run the tests. `spec.lock` shows if a copy changed a source file.
6. Replace the app-specific entries in `components.json` with the new app's components.

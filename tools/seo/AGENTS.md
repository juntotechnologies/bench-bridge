# tools/seo/

Writes the discovery files, the icons and the home page tags from `site/seo.json`.

## Domain
- `site/seo.json` holds the copy: title, description, summary, crawlers, agent rules and links.
- Each other fact keeps its own source. The generator reads it and never copies it.
- The URL is `homepage` in `../../package.json`. The maker and the hub link come from `hub` in `../../shared/data/copy.json`.
- The instruments and the pipeline steps come from the registry. The colours come from `../../design/tokens.json`. The mark is the `bridge` icon in `../../client/ui/icons.ts`.
- `npm run seo` writes the files into `site/public/` and two blocks into `client/index.html`. It redraws only a stale image.
- `npm run lint` runs the same build with `--check`. It fails when a file differs from its source.
- A PNG keeps the hash of its source in a text chunk. The check compares hashes and starts no browser.
- The Open Graph image draws the README screenshot. After `npm run media`, run `npm run seo`.
- A sitemap date is the day of the last commit that touches a page source. It is today while a source has changes.

## Files

<!-- gen:files tools/seo -->
| File | Holds |
| ---- | ----- |
| `agents.ts` | Renders agents.txt and .well-known/agents.json |
| `assets.json` | The fonts and the screenshot that the Open Graph image draws from |
| `assets.ts` | Reads those files, and names them by data URL or by hash |
| `blocks.ts` | Marker pairs in client/index.html, and the function that fills a block |
| `body.ts` | Renders the noscript block of the home page |
| `build.ts` | Script: writes the files, or checks them with --check |
| `files.ts` | The table of generated files: text files, the home page and image specs |
| `git.ts` | Finds the sitemap date from git |
| `graphics.ts` | Draws the brand mark as the favicon and as the page for each square icon |
| `head.ts` | Renders the head tags: title, description, canonical, icons, Open Graph, Twitter card and JSON-LD |
| `html.ts` | Escapes text and builds meta tags and script-safe JSON |
| `images.ts` | Plans each image: its source hash, whether it is current, and its draw job |
| `io.ts` | Reads and writes the generated files, and finds the stale ones |
| `jsonLd.ts` | Builds the JSON-LD graph of the maker and the demo |
| `llms.ts` | Renders llms.txt |
| `load.ts` | Loads the Site from seo.json, the registry, the tokens and package.json |
| `manifest.ts` | Renders the web app manifest |
| `og.css` | The style of the Open Graph image |
| `og.ts` | Renders the page that Chromium turns into the Open Graph image |
| `plan.ts` | Reads every input and plans every generated file |
| `png.ts` | Reads the PNG size, and writes and reads the source hash in a PNG text chunk |
| `render.ts` | Draws pages to PNG with Chromium |
| `robots.ts` | Renders robots.txt |
| `schema.ts` | Schema for seo.json |
| `site.ts` | The typed Site: seo.json joined with the facts that other sources own |
| `sitemap.ts` | Renders sitemap.xml |
| `urls.ts` | Names of the discovery files, and absolute and root-relative URLs |
<!-- /gen -->

## Rules
- Write copy in ASD-STE100. Say "demo with sample data".
- Mark a spec with no real source as "concept". Say only "designed to support validation".
- Never claim that hardware exists, is built or is in build. Never claim compliance with a regulation.
- Show no price and no email address. Name no prospect and no company of a prospect.
- Name a vendor only as a labelled example part. A test fails on a banned claim.
- Keep each function to one job, 15 lines or fewer. Keep renderers pure. Only `assets.ts`, `build.ts`, `git.ts`, `io.ts`, `load.ts`, `plan.ts` and `render.ts` touch the machine.

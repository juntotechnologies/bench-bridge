# site/public/

Generated public files. The Pages build copies them to the site root.

## Rules
- Never edit a file here. Edit `../seo.json` and run `npm run seo`.
- `npm run lint` fails when a file here differs from its source.
- `.well-known/agents.json` is generated too. The list below hides folders that start with a dot.
- Add a static file here only when `../../tools/seo/files.ts` lists it.

## Files

<!-- gen:files site/public -->
| File | Holds |
| ---- | ----- |
| `agents.txt` | What an automated agent may and may not do |
| `apple-touch-icon.png` | Icon for the iOS home screen |
| `favicon.svg` | The browser tab icon |
| `icon-192.png` | App icon, 192 px |
| `icon-512.png` | App icon, 512 px |
| `llms.txt` | A plain summary of the demo for language-model crawlers |
| `manifest.webmanifest` | The web app manifest |
| `og.png` | The Open Graph image, 1200 by 630 px |
| `robots.txt` | The crawler rules, and the sitemap link |
| `sitemap.xml` | The sitemap, with the date of the last change |
<!-- /gen -->

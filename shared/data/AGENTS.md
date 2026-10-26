# shared/data/

JSON registries. Each file is the one source for its facts.

<!-- gen:files shared/data -->
| File | Holds |
| ---- | ----- |
| `catalog.json` | Every planned instrument, ranked by value to a DEA-registered lab |
| `copy.json` | UI text |
| `devices.json` | One entry per live instrument: port, parser, rules, capture and field maps |
| `pipeline.json` | The five pipeline stages |
| `targets.json` | Target systems: endpoint, reference prefix and required fields |
<!-- /gen -->

## Rules
- Add a fact here before you write it as a literal in code.
- A schema in `../registry/schema.ts` validates each file. Change both together.
- Demo values are sample data. Do not present them as real results.

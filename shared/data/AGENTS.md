# shared/data/

JSON registries. Each file is the one source for its facts.

| File | Holds |
|------|-------|
| devices.json | One entry per live instrument: port, parser, rules, capture, field maps |
| catalog.json | Every planned instrument, ranked by value to a DEA-registered lab |
| targets.json | Target systems: endpoint, reference prefix, required fields |
| pipeline.json | The five pipeline stages |
| copy.json | UI text |

## Rules
- Add a fact here before you write it as a literal in code.
- A schema in `../registry/schema.ts` validates each file. Change both together.
- Demo values are sample data. Do not present them as real results.

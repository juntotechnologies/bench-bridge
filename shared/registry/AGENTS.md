# shared/registry/

Loads the JSON in `../data/` once and exports typed values.

## Rules
- Validate each file with a zod schema at load. Export only parsed values.
- Add a new instrument kind to the `ParserConfig` union in `schema.ts`.
- A device is live when it has an entry in `../data/devices.json`. `isLive` derives this.
- Keep this directory pure. No side effects beyond reading the JSON.
- A catalogue entry's `connection` is the one source for its connection type. The port kind derives from it (`portKind`). Labels live in `copy.connections`.

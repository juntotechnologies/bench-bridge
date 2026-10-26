# shared/

Code and data that both client and server use. It holds no UI, no network and no server code.

## Domain
- The bridge reads an instrument's native output. It never changes the instrument.
- The LIMS stays the system of record. The bridge moves data into it.
- Registry JSON in `data/` is the one source for devices, targets, the catalogue, stages and UI copy.

## Rules
- Import from no other area. Others import this area as `@shared/*`.
- No DOM, no `fetch`, no Node modules, no clock, no random source. Pass them in.
- Data that crosses areas is a zod schema in `contracts.ts`.

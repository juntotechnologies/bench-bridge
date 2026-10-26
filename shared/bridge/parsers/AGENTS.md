# shared/bridge/parsers/

One parser per protocol kind.

## Rules
- Add a parser file and one row in `index.ts`. The table must cover every kind in the registry schema.
- A parser takes config, captured lines and a sample ID. It returns readings.
- Skip lines that do not match the protocol. Do not throw on bad lines.
- Keep the protocol pattern in one named constant per file.

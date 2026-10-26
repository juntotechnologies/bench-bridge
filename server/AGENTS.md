# server/

The delivery API: mock LIMS and CS ledger endpoints, and the dev server.

## Domain
- A target accepts a record only when every required field is present. A rejected record names the missing fields.
- The CS ledger is stateless in this tracer. Every run starts from the opening balance in `data/ledger.json`.
- The server owns the clock and the reference numbers.
- Say "designed to support validation". Never claim Part 11 compliance.

## Rules
- Import `shared` as `@shared/*`. Never import `client`.
- Validate every request once, at the edge, with a schema from `@shared/contracts`.
- Log rejections with a stable event name and the device ID. Never log payloads.
- `npm run health` must report the server state in one command.

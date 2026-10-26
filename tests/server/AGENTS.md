# tests/server/

Tests for `server/`: delivery, the ledger, the handler and the ledger drift check.

## Rules
- Test the handler as a function. Do not start an HTTP server.
- Every live device must name a container that exists in the ledger. Keep that check.

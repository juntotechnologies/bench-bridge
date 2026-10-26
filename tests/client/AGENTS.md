# tests/client/

Tests for `client/` logic that needs no browser: the store, the run flow and text formats.

## Rules
- Pass fake `send` and `schedule` functions into `startRun`. Do not use real timers or a real network.
- Browser behaviour is checked in a real browser walk at the tailnet link.

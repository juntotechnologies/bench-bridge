# tests/tools/

Tests for `tools/`: the AGENTS.md helpers and the local lint rules.

## Rules
- Test a lint rule with ESLint's `Linter` on short code strings. Cover one accepted case and each rejected case.
- Import the pure helper modules. Never import a script that runs `main()` on import.

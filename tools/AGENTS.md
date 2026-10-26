# tools/

Repo tooling that enforces the rules.

<!-- gen:files tools -->
| File | Holds |
| ---- | ----- |
| `agents-md.ts` | Pure helper: which directories lack AGENTS.md |
| `check-agents-md.ts` | Script that runs the AGENTS.md check and sets the exit code |
| `docs/` | Docs generator: fills generated blocks and checks references |
| `eslint/` | Local ESLint rules |
| `repo-files.ts` | Walks the repo: checked directories, entries and markdown files |
<!-- /gen -->

## Rules
- A new rule goes in lint when lint can enforce it. Write prose only when it cannot.
- Settings (limits, ignore lists) live in `../code-shape.json`.

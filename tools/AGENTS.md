# tools/

Repo tooling that enforces the rules.

| Item | Job |
|------|-----|
| eslint/ | Local ESLint rules |
| agents-md.ts | Pure helpers: which directories to check, which lack AGENTS.md |
| check-agents-md.ts | Thin script that runs the check and sets the exit code |

## Rules
- A new rule goes in lint when lint can enforce it. Write prose only when it cannot.
- Settings (limits, ignore lists) live in `../code-shape.json`.

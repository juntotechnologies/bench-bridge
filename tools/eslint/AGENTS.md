# tools/eslint/

Local ESLint rules, in plain JavaScript so ESLint can load them without a build step.

## Rules
- One rule per file, with a one-line file docstring.
- The typed-boundary rules apply to TypeScript only. These JavaScript files are exempt.
- Keep each rule a few small functions. Do not nest functions.

# tests/

All tests live here. The directory mirrors the code areas.

## Rules
- Put a test in `tests/<area>/`. No area has its own test directory.
- Import code through `@shared/*`, `@client/*` and `@server/*`.
- Every module is tested on its own.
- Write the failing test first.
- Test files may nest functions (`describe`, `it`). Other lint rules still apply.

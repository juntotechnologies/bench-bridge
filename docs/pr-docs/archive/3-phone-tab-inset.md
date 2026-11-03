# PR 3: Inspector tab inset

Status: done

Branch: `fix/phone-tab-inset`

## Goal
`ops site-check` flagged inspector tabs: label 5px from button edge; limit 6px. Tab side padding 4px → 6px.

## Implementation Checklist
- [x] `.tabs button` padding in `client/styles.css`

## Smoke Tests
- `npm run fit`: ok at 9 sizes, 7 devices
- `ops site-check shots` on tailnet link

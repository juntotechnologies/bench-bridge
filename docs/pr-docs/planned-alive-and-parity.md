# PR: Alive kit and parity for Bench Bridge

Status: in-scope work complete

Branch: `feature/alive-and-parity`

## Goal

Bring the demo in line with the decisions made on the hub, shaunporwal.com and cheminventory.co. Keep the drafting-paper look. Add calm aliveness. Make the layout checks catch faults on a phone.

Shaun asked for this PR on 2026-10-27 and gave full authority to merge it.

## Context

The demo is one page: the app with its delivery API in the browser. It has no cards or long copy. The look lives in `design/`. The fit check lives in `client/scripts/`.

### Parity audit

| Area | Before | Decision elsewhere | Action |
| --- | --- | --- | --- |
| Subtitle | README said "Demo that connects ..."; SEO copy said "can feed ... ledgers" | Hub: "A demo of how older lab instruments feed a LIMS and a controlled-substance ledger." | README and `site/seo.json` use the hub sentence. Generated files follow. |
| Source link label | "Source code" | Hub: "Source on GitHub" (the repo has no licence) | Label changed in `site/seo.json`. |
| Sample data | No label on screen | Hub status: "Sample data". Demo data is sample data. | Sample tag on the stage. One line on the Deliver tab. |
| Hub link | Present in the top bar | Hub backlink rule | No change. |
| Instruments | Six live, seven planned | Hub lists the six live names | No change. `shared/data/devices.json` is the source. |
| Word "software" | Not used to describe Junto | Banned in public Junto copy | No change. Kit text names instrument drivers only. |
| Tap size | 12 controls under 44 px on a phone | Principle in `design/principles.json` | Raised to the `touch` token. The fit check now fails below it. |
| 360 px top bar | Theme button cut off by 33 px. Pane buttons differ in width. | Phone-first bar | Top bar tightened. Pane buttons share one width. |
| Aliveness | Spinner, line arrival and chart draw only | Shared alive kit | Pointer light, press and lift, edge light, tap pulse, arrival fade. |
| Layout checks | Fit check missed a child that leaves a box that still fits | Layout checks on the hub | `contained` pairs for the top bar. Tap size, equal rows, equal margins and heading lines. |
| README pictures | Made before this change | Pictures match the live demo | Made again with `npm run media`. |
| Hub preview and clip | Show the old look (hub repo, read only here) | Pictures match the live demo | Hub must run its clip script after this deploy. Listed as a follow-up. |
| Email in generated files | None | Never write the email address into a generated file | `tests/tools/seoCopy.test.ts` keeps failing on one. No change. |

## Implementation Checklist

### Tier 1 - Copy and tokens

- [x] Align the subtitle in `README.md` and `site/seo.json`. Run `npm run seo`.
- [x] Add `sample` and `deliver.mock` to `shared/data/copy.json`.
- [x] Add the sample tag to the stage and the hint to the Deliver tab.
- [x] Add tokens for the pointer light, the edge light, the lift, the press and the timings to `design/tokens.json`.
- [x] Add six recipes to `design/components.json` and six rules to `design/principles.json`. Run `npm run design`.

### Tier 2 - Alive kit

- [x] Test first: `tests/client/pointerLight.test.ts` for the light position and the query.
- [x] Write `client/ui/pointerLight.ts` and bind it in `client/main.ts`. Mark the cards with `data-glow`.
- [x] Add press and lift, the edge light on Run, the tap pulse and the arrival fade to `client/styles.css`.
- [x] Reduced motion hides the edge light. The pointer light shows only for a pointer that can hover.

### Tier 3 - Layout budget

- [x] Test first: `tests/client/layoutBudget.test.ts` for tap size, rows, margins and heading lines.
- [x] Write `client/scripts/layoutBudget.ts` and `client/scripts/layoutProbe.ts`. Set the limits in `client/scripts/fit.json`.
- [x] Write `client/scripts/lightWalk.ts` and run it for each window size.
- [x] Raise each control on a compact window to the touch size.
- [x] Tighten the top bar so it fits at 360 px. Add the top bar children to `contained`.
- [x] Update the `AGENTS.md` files and the note for `npm run fit`.

## Acceptance Coverage

| Requirement | Entry points | Roles and data | Persistence | Verification |
| --- | --- | --- | --- | --- |
| Copy matches the hub | README, `llms.txt`, page tags | None | None | `npm run seo` check in lint, `tests/tools/seoCopy.test.ts` |
| Sample data shows on screen | Stage, Deliver tab | Each of six instruments | None | Walk 1 |
| Alive kit works and stops on request | Stage, top bar, pipeline, Run | Pointer, touch, reduced motion | None | Walks 2 and 3, `client/scripts/lightWalk.ts` |
| A phone gets 44 px controls and a fitting top bar | All panes and tabs | 360, 390 and 430 px | None | `npm run fit`, Walk 4 |

## Smoke Tests

Run on the built site at the preview address, with a desktop pointer and with touch emulation.

- [x] **Sample data is marked**
  1. Open the demo at 1440 px.
  2. Press **Run bridge**. Open the **Deliver** tab.

  **Pass if:**
  - The tag **Sample data** shows at the top left of the drawing.
  - The Deliver tab starts with the line about mock systems and sample data.

- [x] **The alive kit answers**
  1. Move the pointer over the instrument list, the drawing and a pipeline step.
  2. Hover and press **Run bridge**, **Back to Junto Technologies** and the theme button.

  **Pass if:**
  - A faint light follows the pointer over each card.
  - Each control rises on hover and sinks when pressed.
  - The orange bridge tap fades in and out on the instrument view, and holds still on the kit view.

- [x] **Reduced motion stops the moving cues**
  1. Open the demo with reduced motion on.

  **Pass if:**
  - The edge light on **Run bridge** is gone.
  - The pointer light does not show.
  - The bridge tap does not fade.

- [x] **A phone fits**
  1. Open the demo at 360, 390 and 430 px, in light and dark.
  2. Open each pane and each tab.

  **Pass if:**
  - The theme button shows fully in the top bar.
  - The three pane buttons share one width.
  - Each control is at least 44 px tall.
  - The page does not scroll.

Evidence: walks in Chromium on the built site (`vite preview` of `dist-pages`) at 1440, 820, 360, 390 and 430 px in light and dark, with pointer, touch and reduced-motion contexts. The built site is the commit `69df280`. The live site gets the same walk after the merge.

### Automated checks

| Check | Result |
| --- | --- |
| `npm run check` (typecheck, lint, test, drawings, build, build for Pages) | Pass. 37 test files, 331 tests. |
| `npm run fit` (nine window sizes, six instruments, layout budget, pointer light) | Pass. "fit ok at 9 sizes, 6 devices". |

## Agent Review

A fresh review agent was not run: this worker cannot start an agent. The whole diff was reread as a hostile reviewer. The fit check fails on each fault it was written for, as shown in the Review Corrections section.

## Review Corrections

| Source | Class | Prevention | Proof |
| --- | --- | --- | --- |
| Reread of the 360 px screenshot | Defect: the theme button left the window | `contained` pairs for the top bar children | The first probe run listed it before the fix |
| Layout probe on the old stylesheet | Defect: 12 controls under 44 px, pane buttons of unequal width | Tap size and row checks in `client/scripts/fit.json` | The probe failed on the old stylesheet and passes now |

## Product Decisions

- Aliveness is restrained. The page has one ambient cue for the main action and one for the tappable part of the drawing.
- No pulse on a status dot. A live dot would suggest a real connection. The demo has none.
- The pointer light, the edge light and the press feedback use tokens only. A test fails on a raw colour or timing.
- The shared rules go to the `site-taste` skill in `agent-skills`. The rules of this app stay in `design/principles.json`.

## Scope

- Resolves the request of 2026-10-27 to bring Bench Bridge in line with the other sites.
- Moves the hub clip and preview refresh to the hub repository.

## Non-Goals

- No new instrument.
- No change to the drawings, the pipeline, the delivery API or the validation story.
- No change to the colours of `paper`, `ink` and `accent`. The hub compares them.

## Related Docs

- [Design spec](../../design/SPEC.md)

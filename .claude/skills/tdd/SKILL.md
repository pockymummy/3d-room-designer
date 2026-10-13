---
name: tdd
description: Use when adding or changing behavior in this repo (features, bug fixes, refactors). Enforces test-first red/green/refactor with this project's test levels, Playwright workflow and final checks.
---

# Test-first development in this repo

Why we work this way: ADR 0010 (`docs/adr/0010-test-first-development.md`). Tool decisions: ADR 0007 (Vitest), 0008 (Playwright). Commands are in `CLAUDE.md`.

## 1. Pick the level
| Change | Test | Notes |
|---|---|---|
| Pure logic in `src/core`, `src/layout.ts` | Vitest, node environment | Real objects, assert state; no mocks |
| React component | jsdom (`// @vitest-environment jsdom`) | Fake `dispatch`, assert the command sent |
| Wiring (store -> scene -> UI -> keys) | `createApp` integration test | Real store, real `buildRoom`, plain `THREE.Scene` |
| Canvas pixels, real mouse/focus/keys | Playwright | Few tests; see section 4 |

Never add test-only hooks (like `window.__app`) to app code.

Design uncertain, or the refactor shape unclear? Use the `spike` skill first; it ends by handing back here for a refactor round and a feature round.

## 2. The cycle (one behavior at a time)
1. **Existing code you will refactor:** first write a PIN, a characterization test that passes today. Refactor only under it.
2. **Red:** write ONE failing test. Run it. Confirm it fails for the right reason (missing behavior, not a typo or import error). Write the test and the code in separate steps, never together.
3. **Green:** the least code that passes.
4. **Refactor** with tests green. Commit test and code together per slice.
5. **Prove the test can fail:** temporarily break the code, watch the right test go red, revert.

## 3. Adding a command
Union member in `Command`, case in `applyCommand`, case in `describeCommand` (all in `src/core/commands.ts`; the exhaustive `never` checks fail the build otherwise), and an entry in the `samples` list in `src/core/commands.test.ts` (not compiler-checked). Keep commands plain data and handlers pure.

## 4. User-facing feature: outer loop with Playwright
Uses the playwright-cli skill (plan / generate / heal).
1. **Ground in the live app.** Run the seed (`tests/seed.spec.ts`) with `--debug=cli` and `playwright-cli attach`; if that mode does not pause, use `playwright-cli open` against `pnpm dev`. Use `snapshot`, `generate-locator`, `eval`, `screenshot` to learn the existing parts the test touches: locators, setup steps, baseline values.
2. **Actions from observation, outcomes from the requirement.** Reuse generated code for actions the app already supports. Write the assertion for the NEW behavior by hand from the requirement, never from what the app does now. Add the scenario to `specs/room-designer.plan.md` as an expectation.
3. **Confirm red for the right reason:** run it without `fixme` and check it fails because the behavior is missing (not a bad locator or timing). Then commit it as `test.fixme` with a comment naming the feature. `fixme` is skipped, not red, so CI does not enforce the red; this check is yours.
4. **Build the feature** with the inner loops, wire it, remove `fixme`.
5. **If it fails after wiring**, investigate with playwright-cli (`--debug=cli` + `attach`, `snapshot`, `console`, `requests`), then classify:
   - app is wrong -> fix the app; the test was right
   - technical test problem (locator drift, timing) -> fix the test
   - the test's expected behavior disagrees with the app -> stop; check the requirement or ask the user. Never change the expectation just to get green.
   Update the spec only when user-visible behavior legitimately changed.

## 5. Playwright conventions (all tests)
- Existing behavior: the live app is the source of truth, so expectations may be generated and healed to match it.
- One test per file at `tests/<group>/<kebab-name>.spec.ts`, importing from `../fixtures`; header comments `// spec:` and `// seed:`.
- Change colors with the hex box (`getByLabel('Wall hex')`, fill, Enter) or by dragging the picker sliders. Never click a native color input.
- Canvas assertions use `tests/helpers/canvas.ts` (dominant-channel pixel counts with tolerance, excluding the colour panel). Use `expect.poll`, never `networkidle` or sleeps.

## 6. Finish
Run `pnpm test`, `pnpm check:arch`, `pnpm build`, `pnpm e2e`. All four must pass.

## Do not
- Edit a test to match the code just to make it pass.
- Leave a red test on `main` (use `fixme`).
- Write a test and its implementation in one step.
- Test the renderer's feel, visuals or exploratory spikes test-first; check those with `pnpm dev`, and cover what you keep before merging.

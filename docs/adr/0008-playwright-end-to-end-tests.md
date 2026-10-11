# 0008. Playwright end-to-end tests

- Status: Accepted
- Date: 2026-10-11

## Context
The WebGL canvas, real focus and key handling, and real mouse input cannot be checked in Node or jsdom. The playwright-cli skill describes a plan, generate and heal workflow for authoring such tests.

## Decision
- `@playwright/test` (pinned exact), Chromium only, `pnpm e2e`. The config starts `pnpm dev` itself and reuses a running server.
- Layout follows the skill: `tests/fixtures.ts` (navigates to `/`), `tests/seed.spec.ts`, one test per file at `tests/<group>/<kebab-name>.spec.ts`, and scenarios in `specs/room-designer.plan.md`.
- Existing behavior is pinned by exploring and generating tests. A test for a feature that does not exist yet is written by hand first and kept as `test.fixme` until the feature lands.
- The canvas is invisible to accessibility snapshots, so assertions count dominant-channel pixels with tolerance (`tests/helpers/canvas.ts`, decoded in the browser, no image library). The colour panel is excluded from the measured area.
- No test-only hooks in the app. State changes are observed through pixels and the UI; the audit log and wiring are covered by Vitest.
- Colors are changed through the in-page picker (ADR 0009): typing in the hex box or dragging with the mouse.

## Consequences
- A handful of slow tests (about 15 s) that guard what unit tests cannot see.
- Pixel checks need tolerance; exact colors are unstable because the scene is lit.
- The skill's `--debug=cli` pause did not work in this environment (the run finished immediately), so exploration used plain `playwright-cli open` against `pnpm dev`.

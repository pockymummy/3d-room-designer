# 0010. Test-first development (TDD)

- Status: Accepted
- Date: 2026-10-11

## Context
The testing tools are recorded (ADR 0007 Vitest, ADR 0008 Playwright), but the way we use them was only a one-line rule in `CLAUDE.md`. The architecture work in ADR 0006 was built test-first, and the method needs to be written down so later work follows it.

## Decision
- **Behavior changes are test-first** (red, green, refactor), one behavior at a time. The step-by-step procedure lives in the project skill `.claude/skills/tdd/SKILL.md`; this ADR records why.
- **Pins before refactors.** Existing code that will be restructured first gets a characterization test that passes today (for example the `buildRoom` tests before `layoutRoom` was extracted).
- **Test levels and styles.** The pure core is tested with real objects asserting state (Chicago style). The UI boundary is tested with a fake `dispatch` asserting the command sent (London style). Wiring is covered by a `createApp` jsdom integration test. Playwright is acceptance, kept to a few tests.
- **Outer loop for user-facing features.** The Playwright test is written first and committed as `test.fixme` so `main` stays green; `fixme` is removed when the feature is wired. `fixme` is skipped, not red, so confirming it fails for the right reason before committing is a manual step.
- **The live app grounds the existing parts of a new Playwright test.** Locators, setup steps and baseline values are learned from the running app with playwright-cli. The expected outcome of the NEW behavior comes from the requirement, never from what the app currently does.
- **Failures after wiring are investigated with playwright-cli** and classified as an app bug (fix the app), a technical test problem such as locator drift or timing (fix the test), or an expectation that conflicts with the app (go back to the requirement or ask; do not edit the expectation to get green). For existing behavior, generated expectations may be healed to match the app.
- **Not test-driven:** how the renderer and orbit controls feel, visuals, and exploratory spikes. These are checked by running `pnpm dev`, and anything kept gets tests before it is merged.
- **Prove tests can fail.** Temporarily breaking the code to see the right test go red is part of the method.

## Consequences
- The first step of each feature is slower, but tests double as the specification and refactors are safer.
- jsdom does not reproduce real-browser event quirks, and canvas pixel checks need tolerance, so a few Playwright tests remain necessary.
- The method relies on discipline in places the tools cannot enforce: the red check before `fixme`, and the `samples` list for new commands (ADR 0006).
- Honest exception: the view-state module (`src/core/viewState.ts`) had its test and code written together and never failed first. Its guard against view fields in `RoomConfig` was checked by hand by adding a field and confirming `tsc` failed.
- The skill is only as good as its description: if it does not load, `CLAUDE.md` still carries the one-line rule.

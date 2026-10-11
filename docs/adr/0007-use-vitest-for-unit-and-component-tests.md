# 0007. Use Vitest for unit and component tests

- Status: Accepted
- Date: 2026-10-11

## Context
`pnpm build` was the only correctness check. The project already builds with Vite 8 and is `"type": "module"` TypeScript, which Jest handles awkwardly.

## Decision
- **Vitest** (pinned exact) reuses `vite.config.ts` through `vitest.config.ts`. Tests live next to the code as `src/**/*.test.ts(x)`; `pnpm test` runs `vitest run`.
- Default environment is Node: core and layout tests run without a DOM, so accidental DOM use throws. Component and integration tests opt in per file with `// @vitest-environment jsdom` and use Testing Library.
- Playwright specs (`tests/`, `specs/`) are not matched by Vitest.
- Tests are written test-first (red, green, refactor); characterization tests ("pins") are written before refactoring existing code. The method is recorded in ADR 0010.
- Core tests assert state with real objects (Chicago style); the UI boundary asserts the commands it dispatches.

## Consequences
- Fast feedback on the pure core; the `three` module works headless, so `buildRoom` is testable without WebGL.
- jsdom is a simulation: it does not reproduce real-browser event quirks or rendering, which is why Playwright also exists (ADR 0008).
- `tsc` type-checks test files too (they sit under `src`).

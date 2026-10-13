# 0013. A separate debug dev server that logs the browser to a file

- Status: Accepted
- Date: 2026-10-13

## Context
Behaviour in a person's own browser (for example, a draw attempt that "did nothing") is invisible to a coding assistant or to anyone reading the repo. Browser DevTools output stays in the browser. Playwright can capture a console, but only for scripted runs, not for a real session.

## Decision
- `pnpm dev:debug` runs `vite.debug.config.ts`: the normal Vite config plus a plugin that injects a small logger into the page and receives its reports at `/__debug-log`, appending them to `debug-logs/browser.log` (gitignored, cleared on each server start).
- The logger records `console.*` output, uncaught errors, `pointerdown` and `click` events (position and target), and changes to `aria-pressed`.
- It runs on port 5174 (strict) so it never clashes with `pnpm dev` or Playwright's `reuseExistingServer` on 5173.
- Nothing in `src/` changes. The "no test-only hooks in app code" rule from `CLAUDE.md` still holds: the hook lives in tooling, which the app, `pnpm build` and `pnpm dev` never load.

## Consequences
- A real manual session can be debugged from a file, without installing a browser extension.
- The logger only sees what the browser exposes: DOM events and console output, not app state such as the number of walls. Temporary `console.log` calls in the app cover that and get removed afterwards.
- It is not covered by automated tests; it was checked by running scripted clicks against it and reading the log.
- The config file is outside `tsconfig.json`'s `include`, so `tsc` does not check it.

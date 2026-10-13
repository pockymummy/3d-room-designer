# Architecture Decision Records

An ADR captures one significant decision: the context, what was decided, and the consequences.
Files are named `NNNN-short-title.md`. Copy [0000-template.md](0000-template.md) to start a new one.
Never rewrite history: to change a decision, add a new ADR and mark the old one `Superseded by NNNN`.

Status values: `Proposed`, `Accepted`, `Deprecated`, `Superseded by NNNN`.

## Index
| # | Title | Status |
|---|-------|--------|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-use-vanilla-threejs-vite-typescript.md) | Use vanilla Three.js, Vite and TypeScript | Accepted (UI-framework part superseded by 0005) |
| [0003](0003-use-pnpm-and-exact-version-pins.md) | Use pnpm and exact version pins | Accepted |
| [0004](0004-room-as-data-config.md) | Describe the room as data, rendered by a builder | Accepted (rectangular config superseded by 0011) |
| [0005](0005-add-react-for-ui.md) | Add React for UI panels | Accepted |
| [0006](0006-functional-core-snapshot-history-audit-log.md) | Functional core, snapshot history and audit log | Accepted |
| [0007](0007-use-vitest-for-unit-and-component-tests.md) | Use Vitest for unit and component tests | Accepted |
| [0008](0008-playwright-end-to-end-tests.md) | Playwright end-to-end tests | Accepted |
| [0009](0009-in-page-color-picker-react-colorful.md) | In-page color picker (react-colorful) | Accepted |
| [0010](0010-test-first-development.md) | Test-first development (TDD) | Accepted |
| [0011](0011-room-as-wall-list.md) | Describe walls as a list of segments | Accepted |
| [0012](0012-draw-wall-tool.md) | Draw-wall tool: two clicks, view state until the second | Accepted |
| [0013](0013-debug-dev-server-with-browser-log-file.md) | A separate debug dev server that logs the browser to a file | Accepted |

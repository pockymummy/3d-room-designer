# 0006. Functional core, snapshot history and audit log

- Status: Accepted
- Date: 2026-10-11

## Context
The UI used to mutate the shared `RoomConfig` in place and call a rebuild callback. That left no undo, nothing to test without a DOM, and no record of what changed. Save/load, undo/redo and furniture are coming and would multiply the problem.

## Decision
- **Pure core.** `src/core/`, `src/layout.ts` and `src/roomConfig.ts` are plain TypeScript with no DOM, React or three.js. They are checked by dependency-cruiser (`pnpm check:arch`) and by `tsconfig.core.json`, which has no DOM lib or Vite types.
- **Immutable document.** `RoomConfig` fields are `readonly`. Edits are `Command` values (a discriminated union of `{ type, args }` data) applied by `applyCommand`, which returns a new config. Every `switch` over commands ends in an exhaustive `never` check.
- **Commands are data, not the GoF Command pattern.** A command carries no `execute()` and no `undo()`. This is the "action and reducer" style (Redux, CQRS): plain `{ type, args }` messages interpreted by pure functions (`applyCommand`, `describeCommand`, both in `src/core/commands.ts`), with undo done by restoring snapshots (the Memento pattern) instead of inverting commands. Data and behavior are kept apart on purpose: data is plain, serializable and comparable; behavior is pure functions.
- **Snapshot history.** Undo/redo stores whole `RoomConfig` snapshots (`src/core/history.ts`, capped at 100). There is no `invert`; undo can only restore states that existed.
- **Audit log.** The store keeps an append-only log of dispatched commands plus `undo`/`redo`, each with timestamp and source. It is never trimmed by the history cap and never rewritten.
- **Layout split.** `layoutRoom(config)` returns pure `Part[]` (id, size, position, color); `buildRoom` only maps parts to three.js meshes.
- **Document vs view state.** Selection, hover and tool (`src/core/viewState.ts`) live in a separate store: never undoable, never logged, never saved. The camera stays with OrbitControls. `RoomConfig` must not gain view fields (a type test enforces it).
- **Shell.** `createApp` (`src/app.ts`) wires store, scene, UI and keyboard shortcuts and needs no renderer; `main.ts` only adds the renderer, camera, controls and render loop. There are no test-only hooks in the app.

## Consequences
- Core logic is tested with plain unit tests in Node; the wiring has a jsdom integration test; only the renderer needs a real browser.
- Every edit must be expressed as a command. Adding one means adding a case to `applyCommand` and `describeCommand` (the compiler enforces it).
- Whole-config snapshots are cheap while the config is small. Revisit (deltas or commands with `invert`) if state grows large or edits must be sent over a network.
- Replaying the audit log from the initial config is possible but not yet a supported feature.
- `RoomConfig` lives in `src/roomConfig.ts` (re-exported from `src/room.ts`) so the pure layout does not import the three.js module.
- dependency-cruiser 18 does not support TypeScript 7 yet: with its default parser it cruised 0 modules and passed vacuously. It is configured with the `swc` parser (`@swc/core`, pinned) instead, and the rules were verified to fire by temporarily adding a `three` import to core. pnpm does not approve `@swc/core`'s install script, which is enough; `pnpm add` still reports `ERR_PNPM_IGNORED_BUILDS` for it. Switch back to the tsc parser once TypeScript 7 is supported.
- **Tradeoff of central switches versus per-command behavior.** With one `switch` per operation (`applyCommand`, `describeCommand`), adding an operation is cheap (one new function, and the compiler lists unhandled types) but adding a command type means editing every switch, and one command's behavior is spread across them. The classic pattern (behavior on each command) reverses that: new types are cheap, new operations are expensive, and saved commands need a registry to be rebuilt. The compiler can enforce completeness either way; the data version gets a complete, serializable command set with less code. We chose switches because there is one command type and two operations.
- **When to revisit.** Move to a typed handler table (`{ [T in Command['type']]: { apply, describe } }`, still plain data plus pure functions, with behavior grouped per type and completeness enforced by the mapped type) when a third command type arrives, a third operation is added, or a switch passes about 40 lines. Expect one cast in the lookup (`handlers[cmd.type].apply(config, cmd.args)` does not type-check without a helper because TypeScript cannot correlate `type` with `args`). Do not put functions on the command objects, and keep handlers pure (ids and times arrive in `args`, so replaying a log is deterministic).
- **Store limits.** `createStore` is the stateful shell: state lives in closure variables (`history`, `auditLog`, the current snapshot, `listeners`), which keeps it private and lets `store.dispatch` be passed around without `this` binding. Listeners run synchronously in order with no error isolation (a throwing listener stops later ones after the state has already changed), there is no re-entrancy guard (a listener that dispatches nests an update), the injected clock is its only impure input, and state is in memory only until save/load exists.
- **Unchecked list.** The `samples` array in `src/core/commands.test.ts` must get an entry per command type; the compiler cannot check it.

# 0009. In-page color picker (react-colorful)

- Status: Accepted
- Date: 2026-10-11

## Context
The native `<input type="color">` opens a browser popup. In headless Chromium, mouse clicks on that popup did not reach its controls, so the real picker interaction could not be automated. It also fires an `input` event on every step of a drag, which would flood the undo history with one entry per step.

## Decision
- Use `react-colorful` 5.8.1 (pinned exact; MIT; peer `react >=16.8.0`): `HexColorPicker` plus `HexColorInput` per color.
- Each color field keeps a local draft while the user drags or types, and dispatches **one** `setColor` when the gesture ends: `onChangeEnd` on the picker (pointer or key release), Enter or blur on the hex box. A color equal to the current one dispatches nothing; invalid hex dispatches nothing; `#rgb` is expanded.
- The picker exposes `role="slider"` elements ("Color", "Hue"); each field is a `role="group"` named "Wall color" / "Floor color" and the hex box is labelled "Wall hex" / "Floor hex".

## Consequences
- The picker is plain DOM, so jsdom and Playwright can drive it (keyboard in Vitest, real mouse drags in Playwright).
- One drag is one undo step.
- The 3D scene updates when the gesture ends, not live during the drag (it did update live with the native input). A live preview would need preview state outside the document; revisit if it matters.
- Look and feel is the same in every browser. One new runtime dependency.

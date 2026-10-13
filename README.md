# 3D Room Designer

Personal web-based 3D room designer for planning a condo layout: furniture, wallpaper and floor tiles.
Currently it renders a hard-coded default room you can orbit around, recolor (walls and floor), add partition walls to (the "Draw wall" button), and undo/redo with Ctrl+Z / Ctrl+Shift+Z.

## Prerequisites
- Node.js 22 LTS (>= 22.12.0)
- pnpm (`corepack enable pnpm`)

## Run
```
pnpm install
pnpm dev        # dev server
pnpm build      # type-check + production build
pnpm test       # unit and component tests
pnpm e2e        # Playwright end-to-end tests (add --workers=1 if screenshots time out)
pnpm dev:debug  # dev server on :5174 that logs browser console and clicks to debug-logs/browser.log
```

## Draw a wall
Click **Draw wall**, then click a start point and an end point on the floor. Points snap to a 10 cm grid, and the tool turns off after one wall. Press and drag does not draw; use two separate clicks.

## Docs
Architecture decisions live in [docs/adr/](docs/adr/README.md).

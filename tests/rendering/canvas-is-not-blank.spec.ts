// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Page and rendering', () => {
  test('canvas-is-not-blank', async ({ page }) => {
    // 1. Open the app (seed)
    // 2. Capture the canvas area to the right of the colour panel
    const stats = await sceneStats(page);

    expect(stats.distinct).toBeGreaterThan(1);
  });
});

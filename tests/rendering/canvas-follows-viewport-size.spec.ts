// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';

test.describe('Page and rendering', () => {
  test('canvas-follows-viewport-size', async ({ page }) => {
    // 1. Open the app (seed)
    // 2. Resize the viewport to 900x600
    await page.setViewportSize({ width: 900, height: 600 });

    await expect.poll(async () => (await page.locator('canvas').boundingBox())?.width).toBe(900);
    expect((await page.locator('canvas').boundingBox())?.height).toBe(600);
  });
});

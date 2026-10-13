// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { captureScene, diffPixels } from '../helpers/canvas';

test.describe('Walls', () => {
  // Written before the feature existed (outer RED); passes once draw-wall is wired. The click points are floor positions
  // (-1, 0, -1) and (1, 0, 1) as seen from the default camera in the default 1280x720 viewport.
  test('draw-wall-adds-a-wall', async ({ page }) => {
    // 1. Open the app (seed) and capture the canvas area
    const before = await captureScene(page);

    // 2. Click "Draw wall", then click two points on the floor
    await page.getByRole('button', { name: 'Draw wall' }).click();
    await page.mouse.click(628, 376);
    await page.mouse.click(655, 473);

    await expect
      .poll(async () => diffPixels(page, before, await captureScene(page)))
      .toBeGreaterThan(500);

    // 3. Press Ctrl+Z
    await page.keyboard.press('Control+z');

    // The new wall is gone: the scene is back to the original
    await expect
      .poll(async () => diffPixels(page, before, await captureScene(page)))
      .toBeLessThan(50);
  });
});

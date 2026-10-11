// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Colour inputs', () => {
  test('floor-color-input-recolors-floor', async ({ page }) => {
    // 1. Open the app (seed) and count green-dominant pixels in the canvas area
    const before = await sceneStats(page);

    // 2. Fill the "Floor hex" input with #00ff00
    await page.getByLabel('Floor hex').fill('#00ff00');
    await page.getByLabel('Floor hex').press('Enter');

    await expect(page.getByLabel('Floor hex')).toHaveValue('#00ff00');
    await expect
      .poll(async () => (await sceneStats(page)).green)
      .toBeGreaterThan(before.green + 300);
  });
});

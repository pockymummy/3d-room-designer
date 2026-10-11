// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Colour inputs', () => {
  test('wall-color-input-recolors-walls', async ({ page }) => {
    // 1. Open the app (seed) and count blue-dominant pixels in the canvas area
    const before = await sceneStats(page);

    // 2. Fill the "Wall hex" input with #0000ff
    await page.getByLabel('Wall hex').fill('#0000ff');
    await page.getByLabel('Wall hex').press('Enter');

    await expect(page.getByLabel('Wall hex')).toHaveValue('#0000ff');
    await expect
      .poll(async () => (await sceneStats(page)).blue)
      .toBeGreaterThan(before.blue + 5000);
  });
});

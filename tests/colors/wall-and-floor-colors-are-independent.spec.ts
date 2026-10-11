// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Colour inputs', () => {
  test('wall-and-floor-colors-are-independent', async ({ page }) => {
    // 1. Open the app (seed)
    // 2. Fill "Wall" with #0000ff, then fill "Floor" with #00ff00
    await page.getByLabel('Wall hex').fill('#0000ff');
    await page.getByLabel('Wall hex').press('Enter');
    await page.getByLabel('Floor hex').fill('#00ff00');
    await page.getByLabel('Floor hex').press('Enter');

    await expect.poll(async () => (await sceneStats(page)).blue).toBeGreaterThan(5000);
    await expect.poll(async () => (await sceneStats(page)).green).toBeGreaterThan(300);
  });
});

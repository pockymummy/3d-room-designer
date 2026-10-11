// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Colour inputs', () => {
  test('dragging-the-picker-recolors-walls', async ({ page }) => {
    // 1. Open the app (seed) and count blue-dominant pixels in the canvas area
    const before = await sceneStats(page);
    const wall = page.getByRole('group', { name: 'Wall color' });
    const originalHex = await page.getByLabel('Wall hex').inputValue();

    // 2. Drag in the Color square to its top-right corner (full saturation and brightness)
    const square = (await wall.getByRole('slider', { name: 'Color' }).boundingBox())!;
    await page.mouse.move(square.x + square.width / 2, square.y + square.height / 2);
    await page.mouse.down();
    await page.mouse.move(square.x + square.width - 1, square.y + 1, { steps: 8 });
    await page.mouse.up();

    // 3. Drag along the Hue bar to the blue region (two thirds across)
    const hue = (await wall.getByRole('slider', { name: 'Hue' }).boundingBox())!;
    await page.mouse.move(hue.x + 2, hue.y + hue.height / 2);
    await page.mouse.down();
    await page.mouse.move(hue.x + hue.width * 0.667, hue.y + hue.height / 2, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByLabel('Wall hex')).not.toHaveValue(originalHex);
    await expect
      .poll(async () => (await sceneStats(page)).blue)
      .toBeGreaterThan(before.blue + 5000);
  });
});

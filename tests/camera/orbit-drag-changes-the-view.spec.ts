// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { captureScene } from '../helpers/canvas';

test.describe('Camera', () => {
  test('orbit-drag-changes-the-view', async ({ page }) => {
    // 1. Open the app (seed) and capture the canvas area
    const before = await captureScene(page);

    // 2. Drag the mouse across the canvas from the centre
    await page.mouse.move(700, 400);
    await page.mouse.down();
    await page.mouse.move(900, 330, { steps: 10 });
    await page.mouse.up();

    await expect
      .poll(async () => before.equals(await captureScene(page)))
      .toBe(false);
  });
});

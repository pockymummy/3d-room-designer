// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';
import { sceneStats } from '../helpers/canvas';

test.describe('Undo and redo', () => {
  // Written before the feature existed (outer RED); passes once undo is wired in createApp.
  test('undo-restores-wall-color', async ({ page }) => {
    // 1. Open the app (seed) and count blue-dominant pixels
    const original = await sceneStats(page);

    // 2. Fill the "Wall hex" input with #0000ff
    await page.getByLabel('Wall hex').fill('#0000ff');
    await page.getByLabel('Wall hex').press('Enter');
    await expect
      .poll(async () => (await sceneStats(page)).blue)
      .toBeGreaterThan(original.blue + 5000);

    // 3. Press Ctrl+Z
    await page.keyboard.press('Control+z');

    // The walls are back to their original colour
    await expect
      .poll(async () => (await sceneStats(page)).blue)
      .toBeLessThan(original.blue + 500);
  });
});

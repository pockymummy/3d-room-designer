// spec: specs/room-designer.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../fixtures';

test.describe('Page and rendering', () => {
  test('loads-without-console-errors', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
      // A missing favicon is a 404 console error unrelated to the app.
      if (msg.type() === 'error' && !msg.location().url.endsWith('/favicon.ico')) {
        problems.push(msg.text());
      }
    });
    page.on('pageerror', (err) => problems.push(err.message));

    // 1. Open the app (reload so listeners are attached before the page runs)
    await page.reload();

    await expect(page.locator('canvas')).toBeAttached();
    expect(problems).toEqual([]);
  });
});

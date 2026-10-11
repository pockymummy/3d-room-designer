import { test as baseTest } from '@playwright/test';

export { expect } from '@playwright/test';

/** Every test starts on the app's home page. */
export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
});

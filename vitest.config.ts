import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Playwright specs live in tests/ and specs/ and must not be picked up here.
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
);

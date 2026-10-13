import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: 'browser.spec.js',
  outputDir: 'test-results',
  reporter: 'list',
  use: {
    browserName: 'chromium',
    headless: true,
  },
});

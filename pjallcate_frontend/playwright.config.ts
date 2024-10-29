import { defineConfig } from '@playwright/test'

export default defineConfig({
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all tests */
  use: {
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
  },
})

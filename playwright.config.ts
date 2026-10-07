import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

// The browser tests drive the built playground, which shows every component as `ermine add` would copy it.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Two browsers at a time. Each one holds a large page in memory; more than that, on a laptop with other
  // apps open, and the machine starts swapping, which shows up as tests hanging for minutes.
  workers: 2,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Animations are switched off (the theme sets its duration to 0 for this preference), so tests never wait on them.
    reducedMotion: 'reduce',
  },
  webServer: {
    command: `npm run build && npx vite preview playground --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /phone/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: /phone/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /phone/ },
    // A phone-sized screen, for the layouts that change when space is tight.
    { name: 'phone', use: { ...devices['iPhone 13'] }, testMatch: /phone/ },
  ],
})

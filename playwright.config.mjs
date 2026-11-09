import { defineConfig, devices } from '@playwright/test'

// Serves the production build (.output from `nuxt build`). Use
// NITRO_PRESET=node-server so this process can boot the server locally.
// @playwright/test stays a devDependency and is not imported by the app.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    serviceWorkers: 'block',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node .output/server/index.mjs',
    url: 'http://127.0.0.1:3000/dialogue',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      PORT: '3000',
      NITRO_PORT: '3000',
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
    },
  },
})

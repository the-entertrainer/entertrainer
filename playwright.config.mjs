import { defineConfig, devices } from '@playwright/test'

// Serves the production build. `npm run test:e2e` builds with
// NITRO_PRESET=node-server first, so this server can boot locally.
// The default `npm run build` stays on the Vercel preset.
// @playwright/test stays a devDependency and is not imported by the app.
// PLAYWRIGHT_PORT overrides the port. The default stays 3000.
const port = process.env.PLAYWRIGHT_PORT || '3000'
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    serviceWorkers: 'block',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node .output/server/index.mjs',
    url: `${baseURL}/dialogue`,
    reuseExistingServer: !!process.env.CI,
    timeout: 30_000,
    env: {
      PORT: port,
      NITRO_PORT: port,
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
    },
  },
})

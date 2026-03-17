import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [resolve(__dirname, 'tests/**/*.test.ts')]
  },
  resolve: {
    alias: {
      '@datalackey/tooling-core': resolve(__dirname, '../tooling-core/src/index.ts')
    }
  }
})

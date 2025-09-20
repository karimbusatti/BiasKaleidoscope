import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({
  resolve: {
    alias: {
      '@': rootDir
    }
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**']
  }
});

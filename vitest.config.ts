import { defineConfig } from 'vitest/config';

// https://vitest.dev/config/
export default defineConfig({
  test: {
    globals: true,
    env: { VITE_API_URL: 'http://localhost/api' },
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});

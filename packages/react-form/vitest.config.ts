import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@avinlab/form': fileURLToPath(new URL('../form/src/index.ts', import.meta.url)),
    },
  },
  test: {
    name: 'react-form',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    globals: true,
  },
});

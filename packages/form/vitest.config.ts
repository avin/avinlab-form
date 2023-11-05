import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'form',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    globals: true,
  },
});

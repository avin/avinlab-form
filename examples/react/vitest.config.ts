import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@avinlab/form': fileURLToPath(new URL('../../packages/form/src/index.ts', import.meta.url)),
      '@avinlab/react-form': fileURLToPath(
        new URL('../../packages/react-form/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    name: 'example-react',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    globals: true,
  },
});

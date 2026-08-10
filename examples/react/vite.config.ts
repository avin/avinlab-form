import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@avinlab/form': fileURLToPath(new URL('../../packages/form/src/index.ts', import.meta.url)),
      '@avinlab/react-form': fileURLToPath(
        new URL('../../packages/react-form/src/index.ts', import.meta.url),
      ),
    },
  },
});

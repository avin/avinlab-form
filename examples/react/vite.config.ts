import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import localhostCerts from 'vite-plugin-localhost-certs';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localhostCerts()],
  resolve: {
    alias: {
      '@avinlab/form': fileURLToPath(new URL('../../packages/form/src/index.ts', import.meta.url)),
      '@avinlab/react-form': fileURLToPath(
        new URL('../../packages/react-form/src/index.ts', import.meta.url),
      ),
    },
  },
});

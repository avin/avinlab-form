import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import localhostCerts from 'vite-plugin-localhost-certs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localhostCerts()],
});

// @ts-check

import { defineConfig } from 'tsup';
import { getConfig } from '../../getTsupConfig.js';

export default defineConfig([
  {
    ...getConfig({
      entry: ['src/index.ts'],
    }),
    define: {
      __DEV__: process.env.MODE === 'prod' ? 'false' : 'true',
    },
  },
]);

// @ts-check

import { defineConfig } from 'tsup'
import { getConfig } from '../../getTsupConfig.js'

export default defineConfig([
  getConfig({ entry: ['src/*.ts'] }),
])

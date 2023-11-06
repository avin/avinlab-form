import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';

export function getConfig(opts) {
  return {
    entry: opts.entry,
    format: ['esm'],
    target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
    outDir: 'dist',
    dts: true,
    sourcemap: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],

    ...(process.env.MODE === 'prod' && {
      clean: true,
      format: ['cjs', 'esm'],
    }),
  };
}

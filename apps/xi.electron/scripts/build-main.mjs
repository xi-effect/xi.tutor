import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  sourcemap: watch,
  absWorkingDir: root,
  logLevel: 'info',
};

const mainOptions = {
  ...common,
  entryPoints: ['src/main/index.ts'],
  outfile: 'out/main/index.js',
  platform: 'node',
  format: 'esm',
  target: 'node20',
  external: ['electron', 'electron-updater'],
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
};

const preloadOptions = {
  ...common,
  entryPoints: ['src/preload/index.ts'],
  outfile: 'out/preload/index.cjs',
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['electron'],
};

if (watch) {
  const [main, preload] = await Promise.all([
    esbuild.context(mainOptions),
    esbuild.context(preloadOptions),
  ]);
  await Promise.all([main.watch(), preload.watch()]);
} else {
  await Promise.all([esbuild.build(mainOptions), esbuild.build(preloadOptions)]);
}

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch');

function shortBuildSha() {
  const raw = (process.env.SOVLIUM_BUILD_SHA || process.env.GITHUB_SHA || '').trim();
  if (!/^[0-9a-f]{7,40}$/i.test(raw)) return '';
  return raw.slice(0, 7).toLowerCase();
}

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
  external: ['electron', 'electron-updater', 'electron-log', '@jitsi/robotjs'],
  define: {
    'process.env.SOVLIUM_BUILD_SHA': JSON.stringify(shortBuildSha()),
  },
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

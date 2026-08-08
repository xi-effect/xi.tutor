#!/usr/bin/env node
/**
 * Переключение @xipkg/calls-* между npm и link:../../../xi.calls/...
 *
 * Usage: node scripts/switch-calls-deps.mjs npm|link
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageRoot, '../..');
const indexCssPath = path.resolve(repoRoot, 'apps/xi.web/src/index.css');
const modeFilePath = path.resolve(packageRoot, '.calls-deps-mode');
const depsDir = path.resolve(packageRoot, 'calls-deps');

const CALLS_PACKAGES = [
  '@xipkg/calls',
  '@xipkg/calls-chat',
  '@xipkg/calls-compactview',
  '@xipkg/calls-config',
  '@xipkg/calls-hooks',
  '@xipkg/calls-providers',
  '@xipkg/calls-risehand',
  '@xipkg/calls-store',
  '@xipkg/calls-types',
  '@xipkg/calls-ui',
  '@xipkg/calls-utils',
];

/** Только для link: Vite компилирует исходники xi.calls */
const LINK_ONLY_DEPENDENCIES = [
  '@xipkg/switcher',
  '@dnd-kit/core',
  '@dnd-kit/modifiers',
  '@dnd-kit/utilities',
  '@livekit/components-core',
  '@livekit/components-react',
  '@livekit/krisp-noise-filter',
  '@livekit/track-processors',
  '@react-hook/latest',
  'driver.js',
  'framer-motion',
  'livekit-client',
  'zustand',
];

const TAILWIND_MARKER_START = '/* calls-tailwind-sources:start */';
const TAILWIND_MARKER_END = '/* calls-tailwind-sources:end */';

const mode = process.argv[2];

if (mode !== 'npm' && mode !== 'link') {
  console.error('Usage: node scripts/switch-calls-deps.mjs npm|link');
  process.exit(1);
}

const depsPath = path.join(depsDir, `${mode}.dependencies.json`);
const tailwindPath = path.join(depsDir, `tailwind-sources.${mode}.css`);

const callsDeps = JSON.parse(fs.readFileSync(depsPath, 'utf8'));
const tailwindSources = fs.readFileSync(tailwindPath, 'utf8').trim();

const packageJsonPath = path.resolve(packageRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

for (const pkg of CALLS_PACKAGES) {
  delete packageJson.dependencies[pkg];
}

for (const pkg of LINK_ONLY_DEPENDENCIES) {
  delete packageJson.dependencies[pkg];
}

Object.assign(packageJson.dependencies, callsDeps);

fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

fs.writeFileSync(modeFilePath, `${mode}\n`);

const indexCss = fs.readFileSync(indexCssPath, 'utf8');
const startIdx = indexCss.indexOf(TAILWIND_MARKER_START);
const endIdx = indexCss.indexOf(TAILWIND_MARKER_END);

if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  console.error(
    `Markers not found in ${indexCssPath}. Expected ${TAILWIND_MARKER_START} … ${TAILWIND_MARKER_END}`,
  );
  process.exit(1);
}

const before = indexCss.slice(0, startIdx + TAILWIND_MARKER_START.length);
const after = indexCss.slice(endIdx);
const nextIndexCss = `${before}\n${tailwindSources}\n${after}`;

fs.writeFileSync(indexCssPath, nextIndexCss);

console.log(`✓ calls deps → ${mode}`);
console.log(`  ${path.relative(repoRoot, packageJsonPath)}`);
console.log(`  ${path.relative(repoRoot, modeFilePath)}`);
console.log(`  ${path.relative(repoRoot, indexCssPath)}`);
console.log('');
console.log('Дальше: pnpm install');
if (mode === 'link') {
  console.log('  (в xi.calls: pnpm exec turbo run build --filter=\'./packages/calls...\' — для .d.ts)');
}
console.log('  rm -rf apps/xi.web/node_modules/.vite && pnpm dev');

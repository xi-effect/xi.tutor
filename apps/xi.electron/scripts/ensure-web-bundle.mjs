import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webDir = path.resolve(root, '../xi.web/build');
const webIndex = path.join(webDir, 'index.html');
const skip = process.env.ELECTRON_SKIP_WEB_BUILD === '1';

const hasPwaArtifacts =
  fs.existsSync(path.join(webDir, 'sw.js')) || fs.existsSync(path.join(webDir, 'registerSW.js'));

if (skip && fs.existsSync(webIndex) && !hasPwaArtifacts) {
  console.log('[xi.electron] reusing existing xi.web electron bundle');
} else {
  if (hasPwaArtifacts) {
    console.log('[xi.electron] existing web build includes PWA service worker, rebuilding for electron');
  } else {
    console.log('[xi.electron] building xi.web in electron mode');
  }
  const result = spawnSync('pnpm', ['--filter', 'xi.web', 'build:electron'], {
    cwd: path.resolve(root, '../..'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

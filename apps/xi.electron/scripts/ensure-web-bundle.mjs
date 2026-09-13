import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webBuild = path.resolve(root, '../xi.web/build/index.html');

if (!fs.existsSync(webBuild)) {
  console.log('[xi.electron] xi.web electron bundle is missing, building it');
  const result = spawnSync('pnpm', ['--filter', 'xi.web', 'build:electron'], {
    cwd: path.resolve(root, '../..'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

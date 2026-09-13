import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electronPath from 'electron';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(root, '../..');
const rendererUrl = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173';

function waitForUrl(url, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(undefined);
      });
      request.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(probe, 500);
      });
    };
    probe();
  });
}

function run(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
}

const children = [];

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await waitForUrl(rendererUrl);
} catch {
  console.log('[xi.electron] xi.web is not running, starting pnpm --filter xi.web dev');
  children.push(run('pnpm', ['--filter', 'xi.web', 'dev'], repoRoot));
  await waitForUrl(rendererUrl);
}

const build = run('node', ['scripts/build-main.mjs', '--watch'], root);
children.push(build);
await waitForUrl(new URL('/', rendererUrl).href);

const electron = spawn(electronPath, ['.'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_RENDERER_URL: rendererUrl,
  },
});
children.push(electron);

electron.on('exit', (code) => {
  shutdown();
  process.exit(code ?? 0);
});

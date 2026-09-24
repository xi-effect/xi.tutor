import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electronPath from 'electron';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(root, '../..');
const rendererUrl = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173';

function probeUrl(url, timeoutMs = 800) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(undefined);
    });
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Timed out probing ${url}`));
    });
    request.on('error', reject);
  });
}

async function isUrlUp(url) {
  try {
    await probeUrl(url);
    return true;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await probeUrl(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
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

if (await isUrlUp(rendererUrl)) {
  console.log(`[xi.electron] using existing xi.web at ${rendererUrl}`);
} else {
  console.log('[xi.electron] xi.web is not running, starting pnpm --filter xi.web dev');
  children.push(run('pnpm', ['--filter', 'xi.web', 'dev'], repoRoot));
}

console.log(`[xi.electron] waiting for ${rendererUrl}`);
await waitForUrl(rendererUrl);
console.log('[xi.electron] renderer is ready, building main process');

const build = run('node', ['scripts/build-main.mjs', '--watch'], root);
children.push(build);

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
  if (code) {
    console.error(`[xi.electron] Electron exited with code ${code}`);
  } else {
    console.log('[xi.electron] Electron exited');
  }
  shutdown();
  process.exit(code ?? 0);
});

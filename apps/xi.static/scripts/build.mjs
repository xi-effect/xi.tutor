import { cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(appRoot, 'build');

await rm(outDir, { recursive: true, force: true });
await cp(resolve(appRoot, 'public'), outDir, { recursive: true });

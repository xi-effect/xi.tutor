import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tag = process.env.GITHUB_REF_NAME ?? process.argv[2] ?? '';
const match = /^electron-v(\d+\.\d+\.\d+)$/.exec(tag);
if (!match) {
  console.error(`Tag must look like electron-v0.1.0, got: ${tag || '(empty)'}`);
  process.exit(1);
}

const packagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../package.json');
const version = JSON.parse(fs.readFileSync(packagePath, 'utf8')).version;
if (version !== match[1]) {
  console.error(`Tag ${tag} does not match apps/xi.electron version ${version}`);
  process.exit(1);
}

console.log(`Release tag ${tag} matches xi.electron ${version}`);

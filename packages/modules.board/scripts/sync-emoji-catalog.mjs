import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(packageRoot, 'src/utils/emojiCatalog.json');
const pickerEntry = require.resolve('@xipkg/emojipicker');
const bundle = readFileSync(pickerEntry, 'utf8');

const iconIds = [
  ...new Set([...bundle.matchAll(/iconId:\s*"([^"]+)"/g)].map((match) => match[1])),
].sort();
const chars = [
  ...new Set([...bundle.matchAll(/char:\s*"([^"]+)"/g)].map((match) => match[1])),
].sort();

if (iconIds.length === 0 || chars.length === 0) {
  throw new Error('Failed to extract emoji catalog from @xipkg/emojipicker');
}

writeFileSync(catalogPath, `${JSON.stringify({ iconIds, chars }, null, 2)}\n`);
console.log(
  `Wrote ${iconIds.length} icon ids and ${chars.length} chars from ${pickerEntry} to ${catalogPath}`,
);

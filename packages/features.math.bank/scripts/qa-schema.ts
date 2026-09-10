import { resolve } from 'node:path';
import { mathTaskArraySchema } from '../src/model/schema.ts';
import { readGzipJson } from './shared.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'content/tasks.source.json.gz');
const data = readGzipJson<unknown>(SOURCE);
const result = mathTaskArraySchema.safeParse(data);

if (!result.success) {
  console.error(result.error.issues.slice(0, 100));
  process.exitCode = 1;
} else {
  console.log(`Zod schema: ${result.data.length} tasks valid`);
}

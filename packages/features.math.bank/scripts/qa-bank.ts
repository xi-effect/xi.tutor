import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { MATH_GRADES, type MathTask } from '../src/model/schema.ts';
import { canonicalizeForFingerprint } from '../src/lib/normalize.ts';
import { fingerprintStatement, readGzipJson } from './shared.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'content/tasks.source.json.gz');
const PUBLIC = resolve(ROOT, 'public/math-bank');

const errors: string[] = [];
const tasks = readGzipJson<MathTask[]>(SOURCE);

const requiredStrings = (task: MathTask) =>
  [
    ['id', task.id],
    ['topicId', task.topicId],
    ['topic', task.topic],
    ['subtopic', task.subtopic],
    ['statement', task.statement?.text],
    ['answer.display', task.answer?.display],
    ['solution.short', task.solution?.short],
  ] as const;

for (const [index, task] of tasks.entries()) {
  for (const [field, value] of requiredStrings(task)) {
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`#${index} ${task.id ?? '?'}: empty ${field}`);
    }
  }
  if (![5, 6, 7, 8, 9, 10, 11].includes(task.grade)) {
    errors.push(`${task.id}: invalid grade ${task.grade}`);
  }
  if (![1, 2, 3, 4, 5].includes(task.difficulty)) {
    errors.push(`${task.id}: invalid difficulty ${task.difficulty}`);
  }
  if (task.subject !== 'mathematics') {
    errors.push(`${task.id}: invalid subject`);
  }
  if (task.curriculum?.country !== 'RU') {
    errors.push(`${task.id}: invalid curriculum country`);
  }
  if (task.source?.copiedFromExternalBank !== false) {
    errors.push(`${task.id}: copiedFromExternalBank must be false`);
  }
  if (!Array.isArray(task.solution?.steps) || task.solution.steps.length === 0) {
    errors.push(`${task.id}: no solution steps`);
  }
  if (!Array.isArray(task.skills) || task.skills.length === 0) {
    errors.push(`${task.id}: no skills`);
  }
  if (fingerprintStatement(task.statement.text) !== task.fingerprint) {
    errors.push(`${task.id}: stale fingerprint`);
  }

  const rendered = [task.statement.text, ...task.solution.steps].join(' ');
  if (/\+-/.test(rendered)) {
    errors.push(`${task.id}: contains '+-'`);
  }
  if (/(^|[^0-9])1x/.test(rendered)) {
    errors.push(`${task.id}: contains coefficient 1x`);
  }
}

const unique = (values: string[]) => new Set(values).size;
if (unique(tasks.map((task) => task.id)) !== tasks.length) {
  errors.push('duplicate ids');
}
if (unique(tasks.map((task) => task.fingerprint)) !== tasks.length) {
  errors.push('duplicate fingerprints');
}
if (unique(tasks.map((task) => canonicalizeForFingerprint(task.statement.text))) !== tasks.length) {
  errors.push('duplicate canonical statements');
}

if (existsSync(PUBLIC)) {
  const searchDocs = readGzipJson<unknown[]>(resolve(PUBLIC, 'search_documents.json.gz'));
  if (searchDocs.length !== tasks.length) {
    errors.push(`search corpus: ${searchDocs.length} != ${tasks.length}`);
  }

  let shardTotal = 0;
  for (const grade of MATH_GRADES) {
    const path = resolve(PUBLIC, `by_grade/grade-${grade}.json.gz`);
    const gradeTasks = JSON.parse(gunzipSync(readFileSync(path)).toString('utf8')) as MathTask[];
    shardTotal += gradeTasks.length;
    if (gradeTasks.some((task) => task.grade !== grade)) {
      errors.push(`grade-${grade} shard contains another grade`);
    }
  }
  if (shardTotal !== tasks.length) {
    errors.push(`grade shards: ${shardTotal} != ${tasks.length}`);
  }
}

const byDifficulty = Object.fromEntries(
  [1, 2, 3, 4, 5].map((difficulty) => [
    difficulty,
    tasks.filter((task) => task.difficulty === difficulty).length,
  ]),
);

console.log(
  JSON.stringify(
    {
      total: tasks.length,
      uniqueIds: unique(tasks.map((task) => task.id)),
      uniqueFingerprints: unique(tasks.map((task) => task.fingerprint)),
      generatorFamilies: unique(tasks.map((task) => task.generator.id)),
      withFigures: tasks.filter((task) => task.figure !== null).length,
      byDifficulty,
      errors: errors.length,
    },
    null,
    2,
  ),
);

if (errors.length) {
  console.error(errors.slice(0, 100).join('\n'));
  process.exitCode = 1;
}

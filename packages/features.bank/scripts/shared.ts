import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';
import type { MathTask } from '../src/model/schema.ts';
import { canonicalizeForFingerprint, normalizeSearchText } from '../src/lib/normalize.ts';

export const readGzipJson = <T>(path: string): T =>
  JSON.parse(gunzipSync(readFileSync(path)).toString('utf8')) as T;

export const writeJson = (path: string, value: unknown, pretty = false) => {
  writeFileSync(path, JSON.stringify(value, null, pretty ? 2 : undefined), 'utf8');
};

export const writeGzipJson = (path: string, value: unknown) => {
  const json = JSON.stringify(value);
  writeFileSync(path, gzipSync(Buffer.from(json), { level: 9 }));
};

export const fingerprintStatement = (statement: string) =>
  createHash('sha1').update(canonicalizeForFingerprint(statement)).digest('hex').slice(0, 16);

export const makeSearchTerms = (task: MathTask) => [
  task.subjectLabel,
  `${task.grade} класс`,
  task.topic,
  task.subtopic,
  ...task.skills,
  ...task.tags,
  ...task.search.aliases,
  ...task.examMappings.flatMap((mapping) =>
    mapping.taskNumbers.flatMap((number) => [
      `${mapping.exam} ${mapping.year} задание ${number}`,
      `${mapping.exam}:${mapping.year}:${number}`,
    ]),
  ),
  `сложность ${task.difficulty}`,
  `уровень ${task.difficulty}`,
];

export const refreshDerivedFields = (task: MathTask): MathTask => {
  const terms = makeSearchTerms(task);
  return {
    ...task,
    search: {
      ...task.search,
      terms,
      normalizedText: normalizeSearchText(`${task.statement.text} ${terms.join(' ')}`),
    },
    fingerprint: fingerprintStatement(task.statement.text),
  };
};

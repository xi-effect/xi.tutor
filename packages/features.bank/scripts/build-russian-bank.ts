import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { RussianTask } from '../src/model/russian.ts';
import { readGzipJson, writeGzipJson, writeJson } from './shared.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'content/russian/tasks.source.json.gz');
const OUT = resolve(ROOT, 'public/task-bank/russian');

const tasks = readGzipJson<RussianTask[]>(SOURCE);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, 'by_grade'), { recursive: true });

const searchDocuments = tasks.map((task) => ({
  id: task.id,
  subject: task.subject,
  grade: task.grade,
  topic: task.topic,
  subtopic: task.subtopic,
  skills: task.skills,
  difficulty: task.difficulty,
  taskType: task.taskType,
  statement: task.statement.slice(0, 400),
  aliases: task.search.aliases,
  tags: task.tags,
  examTerms: task.examMappings.flatMap((mapping) =>
    mapping.taskNumbers.map((number) => `${mapping.exam} ${number} ${mapping.year}`),
  ),
}));
writeGzipJson(resolve(OUT, 'search_documents.json.gz'), searchDocuments);

for (let grade = 5; grade <= 11; grade += 1) {
  const shard = tasks.filter((task) => task.grade === grade);
  writeGzipJson(resolve(OUT, `by_grade/grade-${grade}.json.gz`), shard);
}

const examIndex: Record<string, string[]> = {};
for (const task of tasks) {
  for (const mapping of task.examMappings) {
    for (const number of mapping.taskNumbers) {
      const key = `${mapping.exam}:${mapping.year}:${number}`;
      (examIndex[key] ??= []).push(task.id);
    }
  }
}
writeJson(resolve(OUT, 'exam_index_2026.json'), examIndex);

const count = (key: (task: RussianTask) => string | number) => {
  const result: Record<string, number> = {};
  for (const task of tasks) {
    const value = String(key(task));
    result[value] = (result[value] ?? 0) + 1;
  }
  return result;
};

writeJson(
  resolve(OUT, 'catalog.json'),
  {
    subject: 'russian',
    version: '2026.09.11',
    totalTasks: tasks.length,
    grades: count((task) => task.grade),
    difficulty: count((task) => task.difficulty),
    topics: count((task) => task.topic),
    examReferenceYear: 2026,
  },
  true,
);

console.log(`Russian task bank built: ${tasks.length} tasks`);

import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { MATH_GRADES, type MathTask } from '../src/model/schema.ts';
import { taskToSearchDocument } from '../src/lib/search.ts';
import { readGzipJson, refreshDerivedFields, writeGzipJson, writeJson } from './shared.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'content/tasks.source.json.gz');
const OUT = resolve(ROOT, 'public/math-bank');

const sourceTasks = readGzipJson<MathTask[]>(SOURCE);
const tasks = sourceTasks.map(refreshDerivedFields);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, 'by_grade'), { recursive: true });

const searchDocuments = tasks.map(taskToSearchDocument);
writeGzipJson(resolve(OUT, 'search_documents.json.gz'), searchDocuments);

for (const grade of MATH_GRADES) {
  const gradeTasks = tasks.filter((task) => task.grade === grade);
  writeGzipJson(resolve(OUT, `by_grade/grade-${grade}.json.gz`), gradeTasks);
}

const catalogMap = new Map<
  string,
  {
    grade: number;
    topicId: string;
    topic: string;
    subtopic: string;
    skills: Set<string>;
    count: number;
  }
>();

for (const task of tasks) {
  const key = `${task.grade}::${task.topicId}::${task.subtopic}`;
  const current = catalogMap.get(key) ?? {
    grade: task.grade,
    topicId: task.topicId,
    topic: task.topic,
    subtopic: task.subtopic,
    skills: new Set<string>(),
    count: 0,
  };
  task.skills.forEach((skill) => current.skills.add(skill));
  current.count += 1;
  catalogMap.set(key, current);
}

const catalog = [...catalogMap.values()]
  .map((item) => ({
    ...item,
    skills: [...item.skills].sort((a, b) => a.localeCompare(b, 'ru')),
  }))
  .sort(
    (a, b) =>
      a.grade - b.grade ||
      a.topic.localeCompare(b.topic, 'ru') ||
      a.subtopic.localeCompare(b.subtopic, 'ru'),
  );
writeJson(resolve(OUT, 'catalog.json'), catalog, true);

const examCounts = new Map<
  string,
  { exam: string; year: number; taskNumber: number; count: number }
>();
for (const task of tasks) {
  for (const mapping of task.examMappings) {
    for (const taskNumber of mapping.taskNumbers) {
      const key = `${mapping.exam}::${mapping.year}::${taskNumber}`;
      const current = examCounts.get(key) ?? {
        exam: mapping.exam,
        year: mapping.year,
        taskNumber,
        count: 0,
      };
      current.count += 1;
      examCounts.set(key, current);
    }
  }
}
const examIndex = [...examCounts.values()]
  .filter((entry) => entry.year === 2026)
  .sort((a, b) => a.exam.localeCompare(b.exam) || a.taskNumber - b.taskNumber);
writeJson(resolve(OUT, 'exam_index_2026.json'), examIndex, true);

const countBy = <T extends string | number>(values: T[]) =>
  Object.fromEntries(
    [...new Set(values)]
      .sort()
      .map((value) => [String(value), values.filter((item) => item === value).length]),
  );

const report = {
  version: tasks[0]?.contentVersion ?? 'unknown',
  total: tasks.length,
  byGrade: countBy(tasks.map((task) => task.grade)),
  byDifficulty: countBy(tasks.map((task) => task.difficulty)),
  byOrigin: countBy(tasks.map((task) => task.source.origin)),
  byGradeDifficulty: Object.fromEntries(
    MATH_GRADES.map((grade) => [
      String(grade),
      Object.fromEntries(
        [1, 2, 3, 4, 5].map((difficulty) => [
          String(difficulty),
          tasks.filter((task) => task.grade === grade && task.difficulty === difficulty).length,
        ]),
      ),
    ]),
  ),
  generatorCount: new Set(tasks.map((task) => task.generator.id)).size,
  uniqueFingerprints: new Set(tasks.map((task) => task.fingerprint)).size,
  withFigures: tasks.filter((task) => task.figure !== null).length,
  searchDocuments: searchDocuments.length,
};
const artifactsDir = resolve(ROOT, 'artifacts/math-bank');
mkdirSync(artifactsDir, { recursive: true });
writeJson(resolve(artifactsDir, 'generation_report.json'), report, true);

console.log(`Built ${tasks.length} math tasks into ${OUT}`);

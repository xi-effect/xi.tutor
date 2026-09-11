import { resolve } from 'node:path';
import type { RussianTask } from '../src/model/russian.ts';
import { russianTaskSchema } from '../src/model/russian.ts';
import { readGzipJson } from './shared.ts';

const SOURCE = resolve(import.meta.dirname, '..', 'content/russian/tasks.source.json.gz');
const tasks = readGzipJson<RussianTask[]>(SOURCE);
const errors: string[] = [];

const duplicates = (values: string[]) => {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      dup.add(value);
    } else {
      seen.add(value);
    }
  }
  return [...dup];
};

if (tasks.length !== 15_000) {
  errors.push(`Expected 15000 tasks, got ${tasks.length}`);
}

for (const value of duplicates(tasks.map((task) => task.id))) {
  errors.push(`Duplicate id: ${value}`);
}

for (const value of duplicates(tasks.map((task) => task.fingerprint))) {
  errors.push(`Duplicate fingerprint: ${value}`);
}

for (const task of tasks) {
  const parsed = russianTaskSchema.safeParse(task);
  if (!parsed.success) {
    errors.push(`${task.id}: schema ${parsed.error.issues[0]?.message ?? 'invalid'}`);
    continue;
  }

  if (/\+-|,,|undefined|None/.test(`${task.statement}${task.explanation}`)) {
    errors.push(`${task.id}: suspicious artifact`);
  }

  for (const mapping of task.examMappings) {
    const max = mapping.exam === 'OGE' ? 13 : 27;
    if (mapping.year !== 2026 || mapping.taskNumbers.some((number) => number < 1 || number > max)) {
      errors.push(`${task.id}: invalid exam mapping`);
    }
    if (
      mapping.relation === 'direct' &&
      ((mapping.exam === 'OGE' && task.grade !== 9) ||
        (mapping.exam === 'EGE' && task.grade !== 11))
    ) {
      errors.push(`${task.id}: invalid direct mapping`);
    }
  }

  if (task.answer.kind === 'choice' && (!task.options || task.answer.value > task.options.length)) {
    errors.push(`${task.id}: invalid choice`);
  }

  if (
    task.answer.kind === 'multi_choice' &&
    (!task.options || task.answer.value.some((number) => number > task.options!.length))
  ) {
    errors.push(`${task.id}: invalid multi-choice`);
  }

  if (task.answer.kind === 'text_set') {
    task.answer.value.forEach((value, index) => {
      if (!task.answer.kind || task.answer.kind !== 'text_set') {
        return;
      }
      if (!task.answer.acceptableByPosition[index]?.includes(value)) {
        errors.push(`${task.id}: invalid text_set`);
      }
    });
  }
}

if (errors.length) {
  console.error(errors.slice(0, 100).join('\n'));
  console.error(`QA failed: ${errors.length}`);
  process.exit(1);
}

console.log(`QA passed: ${tasks.length} tasks, unique IDs/fingerprints, exam mappings valid.`);

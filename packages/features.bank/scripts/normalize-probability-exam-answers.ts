import { gzipSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MathTask, MathTaskExamMapping } from '../src/model/schema.ts';
import { normalizeSearchText } from '../src/lib/normalize.ts';
import { formatTerminatingDecimal, parseExactRational } from '../src/lib/rational.ts';
import { readGzipJson } from './shared.ts';

/**
 * В коротком ответе ОГЭ (задания 1–19) и первой части ЕГЭ ответ — целое или конечная
 * десятичная дробь. Вероятностные задания с такой привязкой переводим на десятичную
 * запись. Если конечной записи нет, задание остаётся в теме, но уходит из экзамена.
 */
const SHORT_ANSWER_LAST: Record<string, number> = {
  OGE: 19,
  EGE_BASE: 21,
  EGE_PROFILE: 12,
};

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, '../../apps/xi.static/content/tasks.source.json.gz');
const PUBLIC_DIRS = [
  resolve(ROOT, '../../apps/xi.static/public/math-bank'),
  resolve(ROOT, 'public/math-bank'),
];

const isProbability = (task: MathTask) =>
  task.taskType === 'probability' || task.topicId.startsWith('probability');

const isShortAnswerNumber = (exam: string, taskNumber: number) => {
  const last = SHORT_ANSWER_LAST[exam];
  return last !== undefined && taskNumber <= last;
};

const hasShortAnswerExam = (mappings: MathTaskExamMapping[]) =>
  mappings.some((mapping) =>
    mapping.taskNumbers.some((number) => isShortAnswerNumber(mapping.exam, number)),
  );

const withoutShortAnswer = (mappings: MathTaskExamMapping[]): MathTaskExamMapping[] =>
  mappings.flatMap((mapping) => {
    const taskNumbers = mapping.taskNumbers.filter(
      (number) => !isShortAnswerNumber(mapping.exam, number),
    );
    if (taskNumbers.length === mapping.taskNumbers.length) return [mapping];
    if (taskNumbers.length === 0) return [];
    return [{ ...mapping, taskNumbers }];
  });

const examTerm = (mapping: MathTaskExamMapping, taskNumber: number) => {
  const label =
    mapping.exam === 'OGE' ? 'ОГЭ' : mapping.exam === 'EGE_BASE' ? 'ЕГЭ база' : 'ЕГЭ профиль';
  return [
    `${mapping.exam}:${mapping.year}:${taskNumber}`,
    `${mapping.exam} ${mapping.year} задание ${taskNumber}`,
    `${label} ${mapping.year} задание ${taskNumber}`,
  ];
};

const removedExamTerms = (before: MathTaskExamMapping[], after: MathTaskExamMapping[]) => {
  const kept = new Set(
    after.flatMap((mapping) => mapping.taskNumbers.map((number) => `${mapping.exam}:${number}`)),
  );
  return new Set(
    before.flatMap((mapping) =>
      mapping.taskNumbers
        .filter((number) => !kept.has(`${mapping.exam}:${number}`))
        .flatMap((number) => examTerm(mapping, number)),
    ),
  );
};

const annotateSolution = (text: string, latex: string, plain: string, decimal: string) => {
  const latexMarker = latex ? `${latex} = ${decimal}` : '';
  if (latexMarker && text.includes(latexMarker)) return text;
  if (latex && text.includes(latex)) {
    const index = text.lastIndexOf(latex);
    return `${text.slice(0, index)}${latexMarker}${text.slice(index + latex.length)}`;
  }

  const plainMarker = `${plain} = ${decimal}`;
  if (text.includes(plainMarker)) return text;
  const pattern = new RegExp(`(?<![\\d/])${plain.replaceAll('/', '\\/')}(?![\\d/])`, 'g');
  const matches = [...text.matchAll(pattern)];
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    const index = last?.index ?? 0;
    return `${text.slice(0, index)}${plainMarker}${text.slice(index + plain.length)}`;
  }

  if (decimal.includes(',') && text.includes(decimal)) return text;
  return text;
};

/** Убирает «Ответ: …» с шагов. В кратком решении оставляет его, только если самой десятичной записи там нет. */
const repairSolution = (task: MathTask) => {
  const value = task.answer.value;
  const suffix = ` Ответ: ${value}.`;
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const shown = (text: string) =>
    new RegExp(`=\\s*${escaped}(?!\\d)`).test(text) ||
    (value.includes(',') && text.includes(value));

  const steps = task.solution.steps.map((step) =>
    step.endsWith(suffix) && step.length > suffix.length ? step.slice(0, -suffix.length) : step,
  );
  if (steps.length > 0 && !steps.some((step) => shown(step))) {
    const last = steps[steps.length - 1] ?? '';
    const trimmed = last.trimEnd();
    const glue = /[.!?]$/.test(trimmed) ? ' ' : '. ';
    steps[steps.length - 1] = `${trimmed}${glue}Ответ: ${value}.`;
  }
  let short = task.solution.short.endsWith(suffix)
    ? task.solution.short.slice(0, -suffix.length)
    : task.solution.short;
  if (!shown(short)) {
    const trimmed = short.trimEnd();
    const glue = /[.!?]$/.test(trimmed) ? ' ' : '. ';
    short = `${trimmed}${glue}Ответ: ${value}.`;
  }

  const changed =
    short !== task.solution.short ||
    steps.some((step, index) => step !== task.solution.steps[index]);
  if (!changed) return false;
  task.solution.steps = steps;
  task.solution.short = short;
  return true;
};

const tasks = readGzipJson<MathTask[]>(SOURCE);
let converted = 0;
let unmapped = 0;
let unchangedProbability = 0;
const grades = new Set<number>();
const changedIds = new Set<string>();
const searchChangedIds = new Set<string>();
const samples: string[] = [];

for (const task of tasks) {
  if (!isProbability(task) || !hasShortAnswerExam(task.examMappings)) {
    if (isProbability(task)) unchangedProbability += 1;
    continue;
  }

  const parsed = parseExactRational(task.answer.value) ?? parseExactRational(task.answer.display);
  const decimal = parsed ? formatTerminatingDecimal(parsed) : null;

  if (decimal) {
    const already =
      task.answer.type === 'number' &&
      task.answer.value === decimal &&
      task.answer.display === decimal;
    if (!already) {
      const latex = /^\\frac\{-?\d+\}\{-?\d+\}$/.test(task.answer.display)
        ? task.answer.display
        : '';
      const plain = /^\d+\/\d+$/.test(task.answer.value)
        ? task.answer.value
        : parsed
          ? `${parsed.numerator}/${parsed.denominator}`
          : '';
      task.answer = { type: 'number', value: decimal, display: decimal };
      task.solution.steps = task.solution.steps.map((step) =>
        annotateSolution(step, latex, plain, decimal),
      );
      task.solution.short = annotateSolution(task.solution.short, latex, plain, decimal);
      converted += 1;
      if (samples.length < 6) samples.push(`${task.id} → ${decimal}`);
    }
    const repaired = repairSolution(task);
    if (!already || repaired) {
      changedIds.add(task.id);
      grades.add(task.grade);
    }
    continue;
  }

  const nextMappings = withoutShortAnswer(task.examMappings);
  if (nextMappings.length === task.examMappings.length) continue;
  const dropped = removedExamTerms(task.examMappings, nextMappings);
  task.examMappings = nextMappings;
  changedIds.add(task.id);
  searchChangedIds.add(task.id);
  task.search.terms = task.search.terms.filter((term) => !dropped.has(term));
  task.search.normalizedText = normalizeSearchText(
    `${task.statement.text} ${task.search.terms.join(' ')}`,
  );
  unmapped += 1;
  grades.add(task.grade);
  if (samples.length < 12) {
    samples.push(`${task.id} снят с экзамена, ответ ${task.answer.value}`);
  }
}

const byId = new Map(tasks.map((task) => [task.id, task]));

const writeSame = (relativePath: string, bytes: Buffer | string) => {
  for (const dir of PUBLIC_DIRS) {
    writeFileSync(resolve(dir, relativePath), bytes);
  }
};

const gzipJson = (value: unknown) => gzipSync(Buffer.from(JSON.stringify(value)), { level: 9 });

writeFileSync(SOURCE, gzipJson(tasks));

for (const grade of grades) {
  const relative = `by_grade/grade-${grade}.json.gz`;
  const shard = readGzipJson<MathTask[]>(resolve(PUBLIC_DIRS[0], relative));
  const next = shard.map((task) => {
    if (!changedIds.has(task.id)) return task;
    const changed = byId.get(task.id);
    if (!changed) return task;
    return {
      ...task,
      answer: changed.answer,
      solution: changed.solution,
      examMappings: searchChangedIds.has(task.id) ? changed.examMappings : task.examMappings,
      search: searchChangedIds.has(task.id) ? changed.search : task.search,
    };
  });
  writeSame(relative, gzipJson(next));
}

const searchDocs = readGzipJson<Array<{ id: string; examMappings: MathTaskExamMapping[] }>>(
  resolve(PUBLIC_DIRS[0], 'search_documents.json.gz'),
);
for (const document of searchDocs) {
  const task = byId.get(document.id);
  if (!task || JSON.stringify(document.examMappings) === JSON.stringify(task.examMappings))
    continue;
  document.examMappings = task.examMappings;
}
const searchGzip = gzipJson(searchDocs);
writeSame('search_documents.json.gz', searchGzip);

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
  .sort((left, right) => left.exam.localeCompare(right.exam) || left.taskNumber - right.taskNumber);
writeSame('exam_index_2026.json', JSON.stringify(examIndex, null, 2));

const oge10 = examIndex.find((entry) => entry.exam === 'OGE' && entry.taskNumber === 10);
const union = tasks.find((task) => task.id === 'math-ru-02905');
const repeating = tasks.find((task) => task.id === 'math-ru-02921');

console.log(
  JSON.stringify(
    {
      converted,
      unmapped,
      unchangedProbability,
      grades: [...grades].sort(),
      ogeTask10: oge10?.count ?? null,
      samples,
      union: union && {
        answer: union.answer,
        exams: union.examMappings,
        short: union.solution.short,
      },
      repeating: repeating && {
        answer: repeating.answer,
        exams: repeating.examMappings,
      },
    },
    null,
    2,
  ),
);

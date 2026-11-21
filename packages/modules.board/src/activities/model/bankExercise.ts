import {
  formatEnglishAnswer,
  formatPhysicsAnswer,
  loadBankTaskById,
  MATH_GRADES,
  type EnglishTask,
  type MathGrade,
  type MathTask,
  type MathTaskSearchDocument,
  type PhysicsTask,
  type RussianTask,
  type RussianTaskAnswer,
} from 'features.bank';
import type { ExerciseContentBlock, ExerciseDefinition, ExerciseFigure } from './types';

type BankTask = MathTask | RussianTask | PhysicsTask | EnglishTask;

const GRADE_SET = new Set<number>(MATH_GRADES);

const uniqueTexts = (values: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
};

const block = (
  role: ExerciseContentBlock['role'],
  text: string | undefined,
): ExerciseContentBlock | null => {
  const value = text?.trim();
  if (!value) return null;
  return { id: role, role, text: value };
};

const blocksOf = (entries: Array<ExerciseContentBlock | null>): ExerciseContentBlock[] =>
  entries.filter((entry): entry is ExerciseContentBlock => Boolean(entry));

const numberedLines = (lines: string[]) =>
  lines.map((line, index) => `${index + 1}. ${line}`).join('\n');

const isGrade = (grade: number): grade is MathGrade => GRADE_SET.has(grade);

const readStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const readFigure = (value: unknown): ExerciseFigure | null => {
  if (!value || typeof value !== 'object') return null;
  const figure = value as ExerciseFigure;
  if (figure.kind === 'circuit' && Array.isArray(figure.resistors)) return figure;
  if (figure.kind === 'graph' && Array.isArray(figure.points)) return figure;
  return null;
};

export function normalizeExerciseDefinition(definition: ExerciseDefinition): ExerciseDefinition {
  const numeric = definition.numeric;
  const wordRange = definition.wordRange;
  return {
    kind: 'exercise',
    blocks: Array.isArray(definition.blocks)
      ? definition.blocks.filter(
          (item) => item && typeof item.text === 'string' && typeof item.role === 'string',
        )
      : [],
    answerDisplay: typeof definition.answerDisplay === 'string' ? definition.answerDisplay : '',
    accepted: readStringList(definition.accepted),
    answerGroups: Array.isArray(definition.answerGroups)
      ? definition.answerGroups
          .map((group) => readStringList(group))
          .filter((group) => group.length > 0)
      : null,
    numeric:
      numeric &&
      typeof numeric.value === 'number' &&
      Number.isFinite(numeric.value) &&
      typeof numeric.tolerance === 'number'
        ? { value: numeric.value, tolerance: numeric.tolerance }
        : null,
    caseSensitive: definition.caseSensitive === true,
    ignoreFinalPunctuation: definition.ignoreFinalPunctuation === true,
    openEnded: definition.openEnded === true,
    hints: readStringList(definition.hints),
    solution: readStringList(definition.solution),
    evidence: typeof definition.evidence === 'string' ? definition.evidence : '',
    rubric: readStringList(definition.rubric),
    wordRange:
      wordRange && typeof wordRange.min === 'number' && typeof wordRange.max === 'number'
        ? { min: wordRange.min, max: wordRange.max }
        : null,
    figure: readFigure(definition.figure),
    source: definition.source ?? null,
  };
}

export function exerciseHasCheck(definition: ExerciseDefinition): boolean {
  const normalized = normalizeExerciseDefinition(definition);
  return !normalized.openEnded && (normalized.accepted.length > 0 || normalized.numeric !== null);
}

export function exerciseAnswerIsCorrect(definition: ExerciseDefinition, raw: string): boolean {
  const normalized = normalizeExerciseDefinition(definition);
  if (!exerciseHasCheck(normalized)) return false;

  const input = raw.trim();
  if (!input) return false;

  if (normalized.numeric) {
    const token = input
      .replace('−', '-')
      .replace(',', '.')
      .match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if (token) {
      const value = Number(token[0]);
      if (
        Number.isFinite(value) &&
        Math.abs(value - normalized.numeric.value) <= normalized.numeric.tolerance + 1e-10
      ) {
        return true;
      }
    }
  }

  const prepare = (value: string) => {
    let next = value.normalize('NFKC').replace(/[’‘]/g, "'").trim().replace(/\s+/g, ' ');
    if (!normalized.caseSensitive) next = next.toLocaleLowerCase();
    if (normalized.ignoreFinalPunctuation) next = next.replace(/[.!?]+$/g, '');
    return next;
  };

  const prepared = prepare(input);
  if (normalized.accepted.some((answer) => prepare(answer) === prepared)) return true;

  const groups = normalized.answerGroups;
  if (!groups || groups.length === 0) return false;

  const parts = input
    .split(/[;\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== groups.length) return false;

  return parts.every((part, index) =>
    (groups[index] ?? []).some((option) => prepare(option) === prepare(part)),
  );
}

const russianAccepted = (
  answer: RussianTaskAnswer,
  options: string[] | undefined,
): Pick<
  ExerciseDefinition,
  'answerDisplay' | 'accepted' | 'answerGroups' | 'rubric' | 'openEnded'
> => {
  const optionLine = (index: number) => {
    const option = options?.[index - 1];
    return option ? `${index}. ${option}` : String(index);
  };

  switch (answer.kind) {
    case 'text':
      return {
        answerDisplay: answer.value,
        accepted: [answer.value],
        answerGroups: null,
        rubric: [],
        openEnded: false,
      };
    case 'text_set': {
      const positions = answer.acceptableByPosition.length
        ? answer.acceptableByPosition
        : answer.value.map((item) => [item]);
      return {
        answerDisplay: answer.value.join('; '),
        accepted: uniqueTexts([answer.value.join('; '), answer.value.join(', ')]),
        answerGroups: positions,
        rubric: [],
        openEnded: false,
      };
    }
    case 'choice': {
      const line = optionLine(answer.value);
      const option = options?.[answer.value - 1];
      return {
        answerDisplay: line,
        accepted: uniqueTexts([line, option, String(answer.value)]),
        answerGroups: null,
        rubric: [],
        openEnded: false,
      };
    }
    case 'multi_choice': {
      const lines = answer.value.map(optionLine);
      return {
        answerDisplay: lines.join('\n'),
        accepted: uniqueTexts([lines.join('\n'), lines.join('; '), lines.join(', ')]),
        answerGroups: null,
        rubric: [],
        openEnded: false,
      };
    }
    case 'rubric':
      return {
        answerDisplay: answer.keyPoints.join('\n'),
        accepted: [],
        answerGroups: null,
        rubric: answer.rubric,
        openEnded: true,
      };
  }
};

const fromMath = (task: MathTask): ExerciseDefinition => {
  const answerDisplay = task.answer.display;
  return {
    kind: 'exercise',
    blocks: blocksOf([block('statement', task.statement.text)]),
    answerDisplay,
    accepted: uniqueTexts([answerDisplay, task.answer.value]),
    answerGroups: null,
    numeric: null,
    caseSensitive: false,
    ignoreFinalPunctuation: false,
    openEnded: false,
    hints: task.hints,
    solution: task.solution.steps,
    evidence: '',
    rubric: [],
    wordRange: null,
    figure: null,
    source: {
      subject: task.subject,
      taskId: task.id,
      exerciseId: task.exerciseId,
      grade: task.grade,
    },
  };
};

const fromRussian = (task: RussianTask): ExerciseDefinition => {
  const answer = russianAccepted(task.answer, task.options);
  return {
    kind: 'exercise',
    blocks: blocksOf([
      block('passage', task.text),
      block('statement', task.statement),
      block('options', task.options ? numberedLines(task.options) : undefined),
    ]),
    ...answer,
    accepted: uniqueTexts(answer.accepted),
    numeric: null,
    caseSensitive: false,
    ignoreFinalPunctuation: false,
    hints: task.hints,
    solution: uniqueTexts([task.explanation]),
    evidence: '',
    wordRange: null,
    figure: null,
    source: {
      subject: task.subject,
      taskId: task.id,
      exerciseId: task.exerciseId,
      grade: task.grade,
    },
  };
};

const fromPhysics = (task: PhysicsTask): ExerciseDefinition => {
  const answerDisplay = formatPhysicsAnswer(task.answer);
  const givens = Object.entries(task.givens)
    .map(([name, value]) => `${name} = ${value}`)
    .join('\n');
  return {
    kind: 'exercise',
    blocks: blocksOf([
      block('instruction', task.instruction),
      block('statement', task.statement),
      block('givens', givens),
    ]),
    answerDisplay,
    accepted: uniqueTexts([
      answerDisplay,
      String(task.answer.value),
      String(task.answer.value).replace('.', ','),
    ]),
    answerGroups: null,
    numeric: { value: task.answer.value, tolerance: task.answer.absoluteTolerance },
    caseSensitive: false,
    ignoreFinalPunctuation: false,
    openEnded: false,
    hints: task.hints,
    solution: task.solution,
    evidence: '',
    rubric: [],
    wordRange: null,
    figure: task.figure ?? null,
    source: {
      subject: task.subject,
      taskId: task.id,
      exerciseId: task.exerciseId,
      grade: task.grade,
    },
  };
};

const fromEnglish = (task: EnglishTask): ExerciseDefinition => {
  const openEnded = task.taskType === 'writing' || Boolean(task.rubric);
  const answer = task.answer;
  const optionLines = task.options?.map((option) => option.text) ?? [];
  let accepted: string[] = [];
  let answerDisplay = '';
  let caseSensitive = false;
  let ignoreFinalPunctuation = false;

  if (answer?.kind === 'text') {
    accepted = answer.accepted;
    answerDisplay = formatEnglishAnswer(task);
    caseSensitive = answer.caseSensitive;
    ignoreFinalPunctuation = answer.ignoreFinalPunctuation;
  } else if (answer?.kind === 'choice') {
    const correct = task.options?.find((option) => option.id === answer.correctOptionId);
    const index = task.options?.findIndex((option) => option.id === answer.correctOptionId) ?? -1;
    answerDisplay = correct?.text ?? answer.correctOptionId;
    accepted = uniqueTexts([
      answerDisplay,
      answer.correctOptionId,
      index >= 0 ? String(index + 1) : undefined,
      index >= 0 ? `${index + 1}. ${answerDisplay}` : undefined,
    ]);
  }

  const rubric = openEnded
    ? uniqueTexts([
        ...(task.rubric?.checklist ?? []),
        ...(task.rubric?.criteria.map(
          (criterion) => `${criterion.name} (${criterion.maxPoints}): ${criterion.guidance}`,
        ) ?? []),
      ])
    : [];

  return {
    kind: 'exercise',
    blocks: blocksOf([
      block('instruction', task.instruction),
      block('passage', task.passage),
      block('statement', task.statement),
      block('options', optionLines.length ? numberedLines(optionLines) : undefined),
    ]),
    answerDisplay: openEnded ? '' : answerDisplay,
    accepted: openEnded ? [] : accepted,
    answerGroups: null,
    numeric: null,
    caseSensitive,
    ignoreFinalPunctuation,
    openEnded,
    hints: task.hints,
    solution: task.solution,
    evidence: task.evidence ?? '',
    rubric,
    wordRange: task.rubric
      ? { min: task.rubric.wordRange[0], max: task.rubric.wordRange[1] }
      : null,
    figure: null,
    source: {
      subject: task.subject,
      taskId: task.id,
      exerciseId: task.exerciseId,
      grade: task.grade,
    },
  };
};

export function bankTaskToExercise(task: BankTask): ExerciseDefinition {
  switch (task.subject) {
    case 'mathematics':
      return fromMath(task);
    case 'russian':
      return fromRussian(task);
    case 'physics':
      return fromPhysics(task);
    case 'english':
      return fromEnglish(task);
  }
}

export function bankExerciseTitle(task: BankTask): string {
  const topic = task.topic.trim();
  const subtopic = task.subtopic.trim();
  if (subtopic && subtopic !== topic) return `${topic} · ${subtopic}`;
  return topic || 'Упражнение';
}

export async function loadBankExercise(document: MathTaskSearchDocument): Promise<{
  definition: ExerciseDefinition;
  title: string;
}> {
  if (!isGrade(document.grade)) {
    throw new Error('Unsupported task grade');
  }

  const task = await loadBankTaskById(
    document.subject ?? 'mathematics',
    document.id,
    document.grade,
  );
  if (!task) {
    throw new Error('Task not found');
  }

  return {
    definition: bankTaskToExercise(task),
    title: bankExerciseTitle(task),
  };
}

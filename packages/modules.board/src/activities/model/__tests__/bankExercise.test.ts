import { describe, expect, it } from 'vitest';
import type { EnglishTask, MathTask, PhysicsTask, RussianTask } from 'features.bank';
import { createEmptyAttempt } from '../defaults';
import { bankTaskToExercise, exerciseAnswerIsCorrect } from '../bankExercise';
import { evaluateActivity } from '../../primitives/evaluate';
import { toggleAnswerVisibility } from '../../primitives/reset';

const mathTask = {
  subject: 'mathematics',
  id: 'math-1',
  exerciseId: '00000000-0000-4000-8000-000000000001',
  grade: 6,
  topic: 'Дроби',
  subtopic: 'Сложение',
  statement: { text: 'Сколько будет $1+1$?' },
  answer: { type: 'number', value: '2', display: '$2$' },
  solution: { short: 'Складываем единицы.', steps: ['Берём 1 и 1.', 'Сумма равна 2.'] },
  hints: ['Это сложение.', 'Ответ — целое число.'],
} as unknown as MathTask;

describe('bankTaskToExercise', () => {
  it('переносит условие, ответ, подсказки и ход рассуждения', () => {
    const exercise = bankTaskToExercise(mathTask);

    expect(exercise.kind).toBe('exercise');
    expect(exercise.blocks.map((block) => block.text)).toEqual(['Сколько будет $1+1$?']);
    expect(exercise.answerDisplay).toBe('$2$');
    expect(exercise.accepted).toEqual(['$2$', '2']);
    expect(exercise.hints).toEqual(mathTask.hints);
    expect(exercise.solution).toEqual(mathTask.solution.steps);
    expect(exercise.source).toMatchObject({ taskId: 'math-1', subject: 'mathematics' });
  });

  it('для русского задания сохраняет текст, варианты и пояснение', () => {
    const task = {
      subject: 'russian',
      id: 'ru-1',
      exerciseId: '00000000-0000-4000-8000-000000000002',
      grade: 7,
      topic: 'Орфография',
      subtopic: 'Корни',
      statement: 'В каком ряду во всех словах пишется одна и та же буква?',
      text: 'Исходный текст',
      options: ['а', 'б', 'в'],
      answer: { kind: 'choice', value: 2 },
      explanation: 'Во втором ряду корень один и тот же.',
      hints: ['Сравните корни.'],
    } as unknown as RussianTask;

    const exercise = bankTaskToExercise(task);

    expect(exercise.blocks.map((block) => block.role)).toEqual(['passage', 'statement', 'options']);
    expect(exercise.answerDisplay).toBe('2. б');
    expect(exercise.solution).toEqual(['Во втором ряду корень один и тот же.']);
    expect(exerciseAnswerIsCorrect(exercise, 'б')).toBe(true);
    expect(exerciseAnswerIsCorrect(exercise, 'а')).toBe(false);
  });

  it('проверяет физический ответ с допуском', () => {
    const task = {
      subject: 'physics',
      id: 'ph-1',
      exerciseId: '00000000-0000-4000-8000-000000000003',
      grade: 8,
      topic: 'Механика',
      subtopic: 'Скорость',
      statement: 'Найдите скорость.',
      instruction: 'Ответ в м/с.',
      givens: { s: 10, t: 2 },
      answer: { kind: 'numeric', value: 5, unit: 'м/с', decimalPlaces: 3, absoluteTolerance: 0.05 },
      hints: ['v = s / t'],
      solution: ['s = 10 м', 't = 2 с', 'v = 5 м/с'],
      figure: {
        kind: 'graph',
        xLabel: 't, с',
        yLabel: 's, м',
        points: [
          [0, 0],
          [2, 10],
        ],
      },
    } as unknown as PhysicsTask;

    const exercise = bankTaskToExercise(task);
    expect(exercise.blocks.map((block) => block.role)).toEqual([
      'instruction',
      'statement',
      'givens',
    ]);
    expect(exercise.figure?.kind).toBe('graph');
    expect(exercise.solution).toHaveLength(3);
    expect(exerciseAnswerIsCorrect(exercise, '5')).toBe(true);
    expect(exerciseAnswerIsCorrect(exercise, '5,04')).toBe(true);
    expect(exerciseAnswerIsCorrect(exercise, '6')).toBe(false);
  });

  it('для сочинения оставляет критерии без автопроверки', () => {
    const task = {
      subject: 'english',
      id: 'en-1',
      exerciseId: '00000000-0000-4000-8000-000000000004',
      grade: 9,
      topic: 'Writing',
      subtopic: 'Email',
      taskType: 'writing',
      instruction: 'Write an email.',
      statement: 'Invite a friend.',
      hints: ['Mention the place.'],
      solution: ['Open the email.', 'Give the details.'],
      rubric: {
        kind: 'educational',
        criteria: [{ name: 'Task', maxPoints: 2, guidance: 'Answer the question.' }],
        wordRange: [80, 100],
        checklist: ['Greeting', 'Closing'],
      },
    } as unknown as EnglishTask;

    const exercise = bankTaskToExercise(task);
    expect(exercise.openEnded).toBe(true);
    expect(exercise.accepted).toEqual([]);
    expect(exercise.rubric).toEqual(['Greeting', 'Closing', 'Task (2): Answer the question.']);
    expect(exercise.wordRange).toEqual({ min: 80, max: 100 });
    expect(exerciseAnswerIsCorrect(exercise, 'Hello')).toBe(false);

    const attempt = createEmptyAttempt(exercise, 1);
    expect(evaluateActivity(exercise, attempt)).toEqual({ correct: 0, total: 0, byItem: {} });
  });
});

describe('evaluateActivity exercise', () => {
  it('сравнивает введённый ответ и умеет снова скрыть его', () => {
    const exercise = bankTaskToExercise(mathTask);
    const attempt = createEmptyAttempt(exercise, 1);
    attempt.values.answer = '2';

    expect(evaluateActivity(exercise, attempt)).toMatchObject({ correct: 1, total: 1 });

    const revealed = toggleAnswerVisibility(exercise, attempt, 'idle');
    expect(revealed.checkStatus).toBe('revealed');
    expect(revealed.attempt.values.answer).toBe('2');
    expect(revealed.attempt.revealed.answer).toBe(true);

    const hidden = toggleAnswerVisibility(exercise, revealed.attempt, revealed.checkStatus);
    expect(hidden.checkStatus).toBe('checked');
    expect(hidden.attempt.revealed.answer).toBe(false);
    expect(hidden.attempt.values.answer).toBe('2');
  });
});

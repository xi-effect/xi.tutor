import { describe, expect, it } from 'vitest';
import { MathVisualInterpreter } from '../core/registry';
import { mathVisualizationCorpus } from '../../tests/corpus/mathVisualizationCorpus';

const interpreter = new MathVisualInterpreter();
const regressionCases = mathVisualizationCorpus.filter(
  (testCase) => testCase.status === 'regression',
);
const coverageCases = mathVisualizationCorpus.filter((testCase) => testCase.status === 'coverage');

describe('math visualization corpus integrity', () => {
  it('contains exactly 1000 RU school formulations', () => {
    expect(mathVisualizationCorpus).toHaveLength(1000);
  });

  it('has unique ids and non-empty metadata', () => {
    const ids = new Set<string>();
    for (const testCase of mathVisualizationCorpus) {
      expect(testCase.id).toBeTruthy();
      expect(ids.has(testCase.id)).toBe(false);
      ids.add(testCase.id);
      expect(testCase.topic).toBeTruthy();
      expect(testCase.gradeBand).toBeTruthy();
      expect(testCase.expected).toBeTruthy();
      expect(testCase.text.trim()).not.toBe('');
      expect(testCase.locale).toBe('ru-RU');
      expect(testCase.educationSystem).toBe('RU');
      expect(testCase.grades).toContain(testCase.grade);
      expect(testCase.curriculum.framework).toBe('federal_school_program');
      expect(testCase.curriculum.alignment).toBe('topic-level');
    }
  });

  it('keeps a substantial regression suite', () => {
    expect(regressionCases.length).toBeGreaterThanOrEqual(500);
  });

  it('keeps an explicit future-coverage suite', () => {
    expect(coverageCases.length).toBeGreaterThanOrEqual(150);
  });
});

describe('supported school formulations', () => {
  it.each(regressionCases.map((testCase) => [testCase.id, testCase] as const))(
    '%s resolves to the expected visualization family',
    (_id, testCase) => {
      const suggestions = interpreter.interpret({ text: testCase.text }, 0.5);
      const types = suggestions.map((suggestion) => suggestion.intent.type);
      expect(types, `Input: ${testCase.text}`).toContain(testCase.expected);
    },
  );
});

describe('future coverage corpus', () => {
  it('is intentionally not treated as regression until an interpreter exists', () => {
    expect(coverageCases.every((testCase) => testCase.status === 'coverage')).toBe(true);
  });
});

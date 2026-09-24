import { describe, expect, it } from 'vitest';
import { interpretGeometryText } from '../geometry';
import { geometryConstraintCorpus } from '../../tests/corpus/geometryConstraints';

describe('geometry/constraints golden corpus', () => {
  it.each(geometryConstraintCorpus)('$id: $category', (testCase) => {
    const model = interpretGeometryText(testCase.text);
    expect(model, testCase.text).not.toBeNull();
    if (testCase.entity) {
      expect(
        model?.entities.some((entity) => entity.type === testCase.entity),
        testCase.text,
      ).toBe(true);
    }
    if (testCase.constraint) {
      expect(
        model?.constraints.some((constraint) => constraint.type === testCase.constraint),
        testCase.text,
      ).toBe(true);
    }
  });
});

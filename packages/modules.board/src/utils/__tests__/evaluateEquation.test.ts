import { describe, expect, it } from 'vitest';
import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';

describe('evaluateEquation', () => {
  it('считает линейное выражение', () => {
    const result = evaluateEquation('2*x+1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.evaluate(3)).toBe(7);
    }
  });

  it('считает sin и степень', () => {
    const result = evaluateEquation('x^2');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.evaluate(4)).toBe(16);
    }
  });

  it('отклоняет пустое и запрещённые символы', () => {
    expect(evaluateEquation('   ').ok).toBe(false);
    expect(evaluateEquation('x + $').ok).toBe(false);
  });
});

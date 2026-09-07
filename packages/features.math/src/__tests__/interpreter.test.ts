import { describe, expect, it } from 'vitest';
import { MathVisualInterpreter } from '../core/registry';

const interpreter = new MathVisualInterpreter();

describe('MathVisualInterpreter', () => {
  it('finds function graph', () => {
    const r = interpreter.interpret({ text: 'Постройте график функции y = x^2 - 4*x + 3' });
    expect(r[0]?.intent.type).toBe('function_graph');
  });

  it('finds coordinate points', () => {
    const r = interpreter.interpret({ text: 'Отметьте точки A(2; 3), B(-1; 4), C(5; -2)' });
    expect(r.some((x) => x.intent.type === 'coordinate_points')).toBe(true);
  });

  it('finds interval', () => {
    const r = interpreter.interpret({ text: '-2 ≤ x < 5' });
    const n = r.find((x) => x.intent.type === 'number_line');
    expect(n).toBeTruthy();
    if (n?.intent.type === 'number_line') {
      expect(n.intent.intervals[0]).toEqual({
        from: -2,
        to: 5,
        fromInclusive: true,
        toInclusive: false,
      });
    }
  });

  it('finds geometry relations', () => {
    const r = interpreter.interpret({ text: 'В треугольнике ABC AB = BC. ∠BAC = 35°.' });
    const g = r.find((x) => x.intent.type === 'geometry');
    expect(g).toBeTruthy();
  });

  it('finds fraction', () => {
    const r = interpreter.interpret({ text: 'Покажите дробь 3/4' });
    expect(r.some((x) => x.intent.type === 'fraction_model')).toBe(true);
  });

  it('finds coin probability tree', () => {
    const r = interpreter.interpret({ text: 'Монету бросают дважды. Покажите возможные исходы.' });
    const p = r.find((x) => x.intent.type === 'probability_tree');
    expect(p).toBeTruthy();
    if (p?.intent.type === 'probability_tree') expect(p.intent.stages).toBe(2);
  });
});

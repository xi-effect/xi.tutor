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
    expect(p?.intent.type === 'probability_tree' && p.intent.stages).toBe(2);
  });
});

describe('MathVisualInterpreter false positives', () => {
  it('не предлагает дробь внутри геометрической длины', () => {
    const suggestions = interpreter.interpret({
      text: 'В треугольнике ABC AB = 3/4, BC = 1, AC = 1.',
    });
    expect(suggestions.some((item) => item.intent.type === 'fraction_model')).toBe(false);
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(true);
  });

  it('не предлагает геометрию по слову «угол» без модели', () => {
    const suggestions = interpreter.interpret({ text: 'Сегодня угол зрения хороший' });
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(false);
  });

  it('не предлагает дерево вероятностей без монеты', () => {
    const suggestions = interpreter.interpret({ text: 'Найдите вероятность события A' });
    expect(suggestions.some((item) => item.intent.type === 'probability_tree')).toBe(false);
  });
});

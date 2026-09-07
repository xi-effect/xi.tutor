import { describe, expect, it } from 'vitest';
import { interpretGeometryText } from '../geometry';

describe('geometry interpreter', () => {
  it('сохраняет entities, угол и символьные длины', () => {
    const model = interpretGeometryText('В треугольнике ABC угол C равен 90°, AB = 10, BC = √19.');
    expect(model?.entities).toContainEqual({
      type: 'triangle',
      id: 'triangle-ABC',
      vertices: ['A', 'B', 'C'],
    });
    expect(model?.constraints).toContainEqual({
      type: 'angle',
      points: ['A', 'C', 'B'],
      value: 90,
    });
    expect(model?.constraints).toContainEqual({
      type: 'length',
      segment: ['B', 'C'],
      value: { type: 'expression', expression: 'sqrt(19)' },
    });
  });

  it('понимает прямой угол без знака градуса и без пробелов', () => {
    const model = interpretGeometryText(
      'В треугольнике ABC уголC равен90, AB = 10, BC = sqrt(19).',
    );
    expect(model?.constraints).toContainEqual({
      type: 'angle',
      points: ['A', 'C', 'B'],
      value: 90,
    });
  });

  it('понимает ту же задачу в LaTeX, как на доске', () => {
    const model = interpretGeometryText(
      'В треугольнике $ABC$ угол $C$ равен $90^{\\circ}$, $AB = 10$, $BC = \\sqrt{19.}$. Найдите $\\cos A$.',
    );
    expect(model?.entities.some((entity) => entity.type === 'triangle')).toBe(true);
    expect(model?.constraints).toContainEqual({
      type: 'angle',
      points: ['A', 'C', 'B'],
      value: 90,
    });
    expect(model?.constraints).toContainEqual({
      type: 'length',
      segment: ['B', 'C'],
      value: { type: 'expression', expression: 'sqrt(19)' },
    });
  });

  it.each([
    ['AH — высота', 'altitude'],
    ['AM является медианой', 'median'],
    ['AD — биссектриса угла A', 'bisector'],
  ] as const)('понимает термин «%s»', (phrase, type) => {
    const model = interpretGeometryText(`В треугольнике ABC ${phrase}.`);
    expect(model?.constraints.some((constraint) => constraint.type === type)).toBe(true);
  });

  it('понимает равные стороны, тупой угол и внешний угол', () => {
    const model = interpretGeometryText(
      'В треугольнике ABC стороны AC и BC равны, угол C равен 168°, угол CBD внешний.',
    );
    expect(
      model?.constraints.some(
        (constraint) =>
          constraint.type === 'equal_length' &&
          constraint.segments.some(
            (segment) => segment.join('') === 'AC' || segment.join('') === 'CA',
          ),
      ),
    ).toBe(true);
    expect(model?.constraints).toContainEqual({
      type: 'angle',
      points: ['A', 'C', 'B'],
      value: 168,
    });
    expect(
      model?.constraints.some(
        (constraint) =>
          constraint.type === 'collinear' &&
          constraint.points.includes('D') &&
          constraint.points.includes('B'),
      ),
    ).toBe(true);
  });

  it('понимает середину, перпендикулярность и параллельность', () => {
    const model = interpretGeometryText('M — середина AB. AB ⟂ CD. EF параллелен GH.');
    expect(model?.constraints.some((constraint) => constraint.type === 'midpoint')).toBe(true);
    expect(model?.constraints.some((constraint) => constraint.type === 'perpendicular')).toBe(true);
    expect(model?.constraints.some((constraint) => constraint.type === 'parallel')).toBe(true);
  });
});

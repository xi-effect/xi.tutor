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

  it('понимает прямоугольный треугольник без «угол C равен 90»', () => {
    const model = interpretGeometryText('Прямоугольный треугольник ABC.');
    expect(model?.constraints).toContainEqual({
      type: 'angle',
      points: ['A', 'C', 'B'],
      value: 90,
    });
  });

  it('не путает острый угол B с прямым углом C', () => {
    const texts = [
      'Острый угол B прямоугольного треугольника ABC равен 9°. Найдите величину угла между высотой CH и медианой CM, проведёнными из вершины прямого угла C.',
      'Острый угол $B$ прямоугольного треугольника $ABC$ равен $9^{\\circ}$. Найдите величину угла между высотой $CH$ и медианой $CM$, проведёнными из вершины прямого угла $C$.',
    ];
    for (const text of texts) {
      const model = interpretGeometryText(text);
      expect(
        model?.constraints.some(
          (constraint) =>
            constraint.type === 'angle' &&
            constraint.points[1] === 'C' &&
            Math.abs(constraint.value - 90) < 1e-6,
        ),
        text,
      ).toBe(true);
      expect(
        model?.constraints.some(
          (constraint) =>
            constraint.type === 'angle' && constraint.points[1] === 'B' && constraint.value === 9,
        ),
        text,
      ).toBe(true);
      expect(
        model?.constraints.some(
          (constraint) =>
            constraint.type === 'angle' &&
            constraint.points[1] === 'B' &&
            Math.abs(constraint.value - 90) < 1e-6,
        ),
        text,
      ).toBe(false);
      expect(
        model?.constraints.some(
          (constraint) =>
            constraint.type === 'altitude' &&
            constraint.segment[0] === 'C' &&
            constraint.segment[1] === 'H',
        ),
        text,
      ).toBe(true);
      expect(
        model?.constraints.some(
          (constraint) =>
            constraint.type === 'median' &&
            constraint.segment[0] === 'C' &&
            constraint.segment[1] === 'M',
        ),
        text,
      ).toBe(true);
    }
  });

  it('понимает катеты без имён вершин', () => {
    const model = interpretGeometryText('Прямоугольный треугольник с катетами 3 и 4.');
    const triangle = model?.entities.find((entity) => entity.type === 'triangle');
    expect(triangle).toMatchObject({ type: 'triangle', vertices: ['A', 'B', 'C'] });
    expect(model?.constraints.filter((constraint) => constraint.type === 'length')).toHaveLength(2);
    expect(
      model?.constraints.some(
        (constraint) => constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6,
      ),
    ).toBe(true);
  });

  it('понимает высоту из вершины без имени основания', () => {
    const model = interpretGeometryText('В треугольнике ABC проведена высота из вершины B.');
    expect(model?.constraints.some((constraint) => constraint.type === 'altitude')).toBe(true);
  });

  it('склеивает разнесённые буквы точек и цифры, как после KaTeX', () => {
    const model = interpretGeometryText(
      'В треугольнике A B C стороны A C и B C равны, угол C равен 1 6 8°, угол C B D внешний.',
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

  it('понимает касательную, секущую и дугу', () => {
    const model = interpretGeometryText(
      'Найдите величину угла ACO, если его сторона CA касается окружности с центром O, отрезок CO пересекает окружность в точке B, а дуга AB окружности равна 66°.',
    );
    expect(model?.entities.some((entity) => entity.type === 'circle')).toBe(true);
    expect(
      model?.constraints.some(
        (constraint) =>
          constraint.type === 'tangent' &&
          constraint.at === 'A' &&
          constraint.line.includes('C') &&
          constraint.line.includes('A'),
      ),
    ).toBe(true);
    expect(
      model?.constraints.some(
        (constraint) => constraint.type === 'point_on_circle' && constraint.point === 'B',
      ),
    ).toBe(true);
    expect(
      model?.constraints.some(
        (constraint) =>
          constraint.type === 'arc_measure' &&
          constraint.from === 'A' &&
          constraint.to === 'B' &&
          constraint.value === 66,
      ),
    ).toBe(true);
  });

  it('понимает четырёхугольник, вписанный в окружность', () => {
    const texts = [
      'Четырёхугольник ABCD вписан в окружность. Угол ABC равен 120°, угол ABD равен 43°. Найдите угол CAD.',
      'Четырёхугольник $ABCD$ вписан в окружность. Угол $ABC$ равен $120^\\circ$, угол $ABD$ равен $43^\\circ$. Найдите угол $CAD$.',
    ];
    for (const text of texts) {
      const model = interpretGeometryText(text);
      expect(model?.entities.some((entity) => entity.type === 'quadrilateral'), text).toBe(true);
      expect(model?.entities.some((entity) => entity.type === 'circle'), text).toBe(true);
      expect(model?.constraints.some((constraint) => constraint.type === 'cyclic'), text).toBe(true);
      expect(
        model?.constraints.filter((constraint) => constraint.type === 'point_on_circle'),
        text,
      ).toHaveLength(4);
      expect(
        model?.constraints.some(
          (constraint) => constraint.type === 'angle' && constraint.value === 120,
        ),
        text,
      ).toBe(true);
      expect(
        model?.constraints.some(
          (constraint) => constraint.type === 'angle' && constraint.value === 43,
        ),
        text,
      ).toBe(true);
      expect(
        model?.entities.some((entity) => entity.type === 'point' && entity.id === 'O' && entity.label === ''),
        text,
      ).toBe(true);
    }
  });

  it('не путает окружность, вписанную в фигуру, с описанной', () => {
    const model = interpretGeometryText('Окружность вписана в треугольник ABC.');
    expect(model?.constraints.some((constraint) => constraint.type === 'cyclic')).toBe(false);
  });
});

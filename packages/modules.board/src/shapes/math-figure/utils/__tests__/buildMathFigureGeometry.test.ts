import { describe, expect, it } from 'vitest';
import { buildMathFigureGeometry } from '../buildMathFigureGeometry';
import { MATH_FIGURE_KINDS } from '../kinds';
import { MATH_FIGURE_VISUAL } from '../visualStyles';

describe('buildMathFigureGeometry', () => {
  it('собирает куб с видимыми, скрытыми рёбрами и подписями', () => {
    const geometry = buildMathFigureGeometry({
      w: 280,
      h: 240,
      kind: 'cube',
      showHiddenEdges: true,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.visibleEdges).toHaveLength(9);
    expect(geometry.hiddenEdges).toHaveLength(3);
    expect(geometry.labels.map((label) => label.text)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'A₁',
      'B₁',
      'C₁',
      'D₁',
    ]);

    const pad = MATH_FIGURE_VISUAL.figurePad;
    const depth = Math.min(280, 240) * 0.32;
    const frontW = Math.max(24, 280 - depth - pad * 2);
    const vertexA = { x: pad, y: pad + depth };
    const vertexB = { x: pad + frontW, y: pad + depth };
    const vertexA1 = { x: pad + depth, y: pad };
    const labelA = geometry.labels.find((label) => label.text === 'A');
    const labelA1 = geometry.labels.find((label) => label.text === 'A₁');
    const labelC = geometry.labels.find((label) => label.text === 'C');
    const labelB = geometry.labels.find((label) => label.text === 'B');

    expect(labelA?.anchor).toBe('end');
    expect(vertexA.x - (labelA?.x ?? 0)).toBeGreaterThanOrEqual(MATH_FIGURE_VISUAL.labelOffset);
    expect(labelA1?.y).toBeLessThan(vertexA1.y);
    expect(labelC?.anchor).toBe('start');
    expect(labelC?.baseline).toBe('hanging');
    expect(labelB?.anchor).toBe('start');
    expect((labelB?.x ?? 0) - vertexB.x).toBeGreaterThanOrEqual(MATH_FIGURE_VISUAL.labelOffset - 1);
  });

  it('прячет скрытые рёбра и подписи по флагам', () => {
    const geometry = buildMathFigureGeometry({
      w: 280,
      h: 240,
      kind: 'cube',
      showHiddenEdges: false,
      showLabels: false,
      showHeight: false,
    });

    expect(geometry.hiddenEdges).toHaveLength(0);
    expect(geometry.labels).toHaveLength(0);
  });

  it('рисует пирамиду с высотой', () => {
    const geometry = buildMathFigureGeometry({
      w: 260,
      h: 250,
      kind: 'pyramid',
      showHiddenEdges: true,
      showLabels: true,
      showHeight: true,
    });

    expect(geometry.visibleEdges.length).toBeGreaterThan(0);
    expect(geometry.hiddenEdges.length).toBeGreaterThan(0);
    expect(geometry.heightEdges).toHaveLength(1);
    expect(geometry.labels.some((label) => label.text === 'S')).toBe(true);
    expect(geometry.labels.some((label) => label.text === 'H')).toBe(true);

    const apex = { x: 260 / 2, y: MATH_FIGURE_VISUAL.figurePad };
    const s = geometry.labels.find((label) => label.text === 'S');
    expect(s).toBeDefined();
    expect(s?.anchor).toBe('middle');
    expect(s?.y).toBeLessThan(apex.y);
    expect(apex.y - (s?.y ?? 0)).toBeGreaterThanOrEqual(12);
    expect(s?.x).toBeCloseTo(apex.x, 0);
  });

  it('рисует цилиндр эллипсом и дугами', () => {
    const geometry = buildMathFigureGeometry({
      w: 200,
      h: 260,
      kind: 'cylinder',
      showHiddenEdges: true,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.ellipses).toHaveLength(1);
    expect(geometry.visibleArcs).toHaveLength(1);
    expect(geometry.hiddenArcs).toHaveLength(1);
    expect(geometry.visibleEdges).toHaveLength(2);
    expect(geometry.visibleArcs[0]?.sweep).toBe(0);
    expect(geometry.hiddenArcs[0]?.sweep).toBe(1);
  });

  it('рисует конус с образующими и основанием', () => {
    const geometry = buildMathFigureGeometry({
      w: 210,
      h: 260,
      kind: 'cone',
      showHiddenEdges: true,
      showLabels: true,
      showHeight: true,
    });

    expect(geometry.visibleEdges).toHaveLength(2);
    expect(geometry.visibleArcs).toHaveLength(1);
    expect(geometry.hiddenArcs).toHaveLength(1);
    expect(geometry.heightEdges).toHaveLength(1);
    expect(geometry.visibleArcs[0]?.sweep).toBe(0);
    expect(geometry.hiddenArcs[0]?.sweep).toBe(1);
    expect(geometry.labels.map((label) => label.text)).toEqual(['S', 'O']);
  });

  it('рисует числовую прямую с делениями от -5 до 5', () => {
    const geometry = buildMathFigureGeometry({
      w: 420,
      h: 88,
      kind: 'number-line',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.hiddenEdges).toHaveLength(0);
    expect(geometry.labels.map((label) => label.text)).toEqual([
      '-5',
      '-4',
      '-3',
      '-2',
      '-1',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(geometry.visibleEdges.length).toBeGreaterThan(11);
  });

  it('по умолчанию рисует треугольник только с высотой', () => {
    const geometry = buildMathFigureGeometry({
      w: 280,
      h: 230,
      kind: 'triangle',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: true,
    });

    expect(geometry.visibleEdges).toHaveLength(3);
    expect(geometry.heightEdges).toHaveLength(1);
    expect(geometry.medianEdges).toHaveLength(0);
    expect(geometry.bisectorEdges).toHaveLength(0);
    expect(geometry.labels.map((label) => label.text)).toEqual(['A', 'B', 'C', 'H']);
  });

  it('рисует медиану и биссектрису по флагам, подпись L у основания', () => {
    const geometry = buildMathFigureGeometry({
      w: 280,
      h: 230,
      kind: 'triangle',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: true,
      showMedian: true,
      showBisector: true,
    });

    expect(geometry.medianEdges).toHaveLength(1);
    expect(geometry.bisectorEdges).toHaveLength(1);
    const L = geometry.labels.find((label) => label.text === 'L');
    expect(L?.baseline).toBe('hanging');
    expect(geometry.labels.map((label) => label.text)).toEqual(['A', 'B', 'C', 'H', 'M', 'L']);
  });

  it('рисует прямоугольный треугольник с прямым углом и высотой к гипотенузе', () => {
    const geometry = buildMathFigureGeometry({
      w: 260,
      h: 210,
      kind: 'right-triangle',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: true,
    });

    expect(geometry.visibleEdges).toHaveLength(3);
    expect(geometry.heightEdges).toHaveLength(1);
    expect(geometry.marks.length).toBeGreaterThanOrEqual(1);
    expect(geometry.labels.map((label) => label.text)).toEqual(['A', 'B', 'C', 'H']);
  });

  it('рисует окружность с радиусом и диаметром', () => {
    const geometry = buildMathFigureGeometry({
      w: 240,
      h: 240,
      kind: 'circle',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.ellipses).toHaveLength(1);
    expect(geometry.ellipses[0]?.rx).toBe(geometry.ellipses[0]?.ry);
    expect(geometry.visibleEdges).toHaveLength(2);
    expect(geometry.labels.map((label) => label.text)).toEqual(['O', 'A', 'B', 'C']);
  });

  it('рисует ионную связь NaCl с переносом электрона', () => {
    const geometry = buildMathFigureGeometry({
      w: 340,
      h: 180,
      kind: 'ionic-bond',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.ellipses).toHaveLength(2);
    expect(geometry.extraDots).toHaveLength(8);
    expect(geometry.labels.map((label) => label.text)).toEqual(['Na', 'Cl', 'e⁻', 'Na⁺', 'Cl⁻']);
  });

  it('рисует ковалентную пару H₂ без лишней черты', () => {
    const geometry = buildMathFigureGeometry({
      w: 260,
      h: 130,
      kind: 'covalent-bond',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.visibleEdges).toHaveLength(0);
    expect(geometry.extraDots).toHaveLength(2);
    expect(geometry.labels.map((label) => label.text)).toEqual(['H', 'H']);
  });

  it('рисует водородную связь линейно O–H···O', () => {
    const geometry = buildMathFigureGeometry({
      w: 380,
      h: 210,
      kind: 'hydrogen-bond',
      showHiddenEdges: true,
      showLabels: true,
      showHeight: false,
    });

    expect(geometry.hiddenEdges).toHaveLength(1);
    const oLabels = geometry.labels.filter((label) => label.text === 'O');
    const hBond = geometry.hiddenEdges[0];
    expect(oLabels).toHaveLength(2);
    expect(Math.abs((hBond?.from.y ?? 0) - (hBond?.to.y ?? 1))).toBeLessThan(2);
  });

  it('рисует воду, CO₂, метан и бензол', () => {
    const water = buildMathFigureGeometry({
      w: 240,
      h: 200,
      kind: 'water',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });
    expect(water.visibleEdges).toHaveLength(2);
    expect(water.labels.map((label) => label.text)).toEqual(['O', 'H', 'H']);

    const co2 = buildMathFigureGeometry({
      w: 320,
      h: 140,
      kind: 'carbon-dioxide',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });
    expect(co2.visibleEdges).toHaveLength(4);
    expect(co2.labels.map((label) => label.text)).toEqual(['O', 'C', 'O']);

    const methane = buildMathFigureGeometry({
      w: 240,
      h: 240,
      kind: 'methane',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });
    expect(methane.visibleEdges).toHaveLength(4);
    expect(methane.labels.filter((label) => label.text === 'H')).toHaveLength(4);

    const benzene = buildMathFigureGeometry({
      w: 240,
      h: 240,
      kind: 'benzene',
      showHiddenEdges: false,
      showLabels: true,
      showHeight: false,
    });
    expect(benzene.visibleEdges).toHaveLength(6);
    expect(benzene.ellipses).toHaveLength(1);
  });

  it('поддерживает все kind без пустой геометрии', () => {
    for (const kind of MATH_FIGURE_KINDS) {
      const geometry = buildMathFigureGeometry({
        w: 200,
        h: 200,
        kind,
        showHiddenEdges: true,
        showLabels: true,
        showHeight: true,
      });
      const drawn =
        geometry.visibleEdges.length +
        geometry.ellipses.length +
        geometry.visibleArcs.length +
        geometry.labels.length;
      expect(drawn).toBeGreaterThan(0);
    }
  });
});

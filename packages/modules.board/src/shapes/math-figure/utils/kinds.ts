export const MATH_FIGURE_KINDS = [
  'cube',
  'pyramid',
  'cylinder',
  'cone',
  'number-line',
  'triangle',
  'right-triangle',
  'isosceles-triangle',
  'rectangle',
  'circle',
  'ionic-bond',
  'covalent-bond',
  'polar-bond',
  'hydrogen-bond',
  'water',
  'carbon-dioxide',
  'methane',
  'benzene',
] as const;

export type MathFigureKind = (typeof MATH_FIGURE_KINDS)[number];

export const MATH_FIGURE_DEFAULT_SIZE: Record<MathFigureKind, { w: number; h: number }> = {
  cube: { w: 280, h: 240 },
  pyramid: { w: 260, h: 250 },
  cylinder: { w: 200, h: 260 },
  cone: { w: 210, h: 260 },
  'number-line': { w: 420, h: 88 },
  triangle: { w: 280, h: 230 },
  'right-triangle': { w: 260, h: 210 },
  'isosceles-triangle': { w: 280, h: 230 },
  rectangle: { w: 280, h: 200 },
  circle: { w: 240, h: 240 },
  'ionic-bond': { w: 340, h: 180 },
  'covalent-bond': { w: 260, h: 130 },
  'polar-bond': { w: 300, h: 170 },
  'hydrogen-bond': { w: 380, h: 210 },
  water: { w: 240, h: 200 },
  'carbon-dioxide': { w: 320, h: 140 },
  methane: { w: 240, h: 240 },
  benzene: { w: 240, h: 240 },
};

export const MATH_FIGURE_MIN_SIZE = 72;

export const MATH_FIGURE_SOLID_KINDS: readonly MathFigureKind[] = [
  'cube',
  'pyramid',
  'cylinder',
  'cone',
];

export const MATH_FIGURE_CHEM_KINDS: readonly MathFigureKind[] = [
  'ionic-bond',
  'covalent-bond',
  'polar-bond',
  'hydrogen-bond',
  'water',
  'carbon-dioxide',
  'methane',
  'benzene',
];

export function isMathFigureKind(value: unknown): value is MathFigureKind {
  return typeof value === 'string' && (MATH_FIGURE_KINDS as readonly string[]).includes(value);
}

export function kindHasHiddenEdges(kind: MathFigureKind): boolean {
  return (MATH_FIGURE_SOLID_KINDS as readonly string[]).includes(kind);
}

export function kindHasHeight(kind: MathFigureKind): boolean {
  return (
    kind === 'pyramid' ||
    kind === 'cone' ||
    kind === 'triangle' ||
    kind === 'right-triangle' ||
    kind === 'isosceles-triangle'
  );
}

export function kindHasMedian(kind: MathFigureKind): boolean {
  return kind === 'triangle';
}

export function kindHasBisector(kind: MathFigureKind): boolean {
  return kind === 'triangle';
}

export function isChemFigureKind(kind: MathFigureKind): boolean {
  return (MATH_FIGURE_CHEM_KINDS as readonly string[]).includes(kind);
}

export function isSolidMathFigureKind(kind: MathFigureKind): boolean {
  return kindHasHiddenEdges(kind);
}

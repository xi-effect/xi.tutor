import type { TSize } from '../../../types';

export const MATH_FIGURE_VISUAL = {
  hiddenDash: '10 8',
  heightDash: '8 7',
  medianDash: '11 4 3 4',
  bisectorDash: '3 5',
  labelFontSize: 18,
  /** Зазор от вершины до ближайшего края буквы, не до её центра. */
  labelOffset: 20,
  tickLength: 10,
  figurePad: 52,
  rightAngleSize: 12,
  atomInset: 16,
  electronRadius: 3.5,
} as const;

export const MATH_FIGURE_LABEL_DY = {
  auto: undefined,
  middle: '0.35em',
  hanging: '1em',
} as const;

const STROKE_WIDTH: Partial<Record<TSize, number>> = {
  s: 1.5,
  m: 2,
  l: 2.5,
  xl: 3.5,
};

/** Толщина линий стереометрии — как у осей, не как у заливных xi-geo. */
export function getMathFigureStrokeWidth(size: TSize): number {
  return STROKE_WIDTH[size] ?? 2;
}

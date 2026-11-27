/** Визуальные константы — не зависят от size фигуры доски. */
export const COORDINATE_AXES_VISUAL = {
  axisStrokeWidth: 1.5,
  plotStrokeWidth: 2.5,
  gridStrokeWidth: 1,
  /** На тёмном фоне полупрозрачный grey.semi уже читается. */
  gridOpacityDark: 0.22,
  /** На белом тот же приём почти невидим, поэтому линия плотнее. */
  gridOpacityLight: 0.55,
  arrowSize: 6,
} as const;

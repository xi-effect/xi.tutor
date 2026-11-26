export function polygonDashArray(dash: string, strokeWidth: number) {
  if (dash === 'dashed') return `${strokeWidth * 4} ${strokeWidth * 2}`;
  if (dash === 'dotted') return `${strokeWidth} ${strokeWidth * 2}`;
  if (dash === 'dash-dot') {
    return `${strokeWidth * 4} ${strokeWidth * 2} ${strokeWidth} ${strokeWidth * 2}`;
  }
  return undefined;
}

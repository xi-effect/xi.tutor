import type { DrLodStyle } from '@ibodr/editor';

const CSS_VAR = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/;

/** Canvas не понимает `var(--token)`. Берём вычисленное значение с корня документа. */
export function resolveBoardCssColor(value: string): string {
  const match = CSS_VAR.exec(value.trim());
  if (!match || typeof document === 'undefined') return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}

export function resolveLodStyle<T extends DrLodStyle | null>(style: T): T {
  if (!style) return style;
  return {
    ...style,
    fill: style.fill ? resolveBoardCssColor(style.fill) : style.fill,
    stroke: style.stroke ? resolveBoardCssColor(style.stroke) : style.stroke,
  };
}

/** Плоская плашка для тяжёлых HTML-фигур, когда их снимают с DOM. */
export function cardLodStyle(fill = 'var(--xi-gray-10)'): DrLodStyle {
  return resolveLodStyle({ fill, stroke: null, strokeWidth: 0 });
}

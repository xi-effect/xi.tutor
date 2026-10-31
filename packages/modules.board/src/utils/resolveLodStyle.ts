import type { DrLodStyle } from '@ibodr/editor';

declare module '@ibodr/editor' {
  interface DrLodStyle {
    /** Ниже этого экранного размера фигура заменяется снимком. Поле движка ibodr. */
    snapshotBelowPx?: number;
  }
}

/** Совпадает с LOD_SNAPSHOT_SCREEN_PX в @ibodr/editor. */
const HEAVY_SHAPE_SNAPSHOT_PX = 180;

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

/**
 * Плоская плашка, когда фигуру снимают с DOM.
 * `snapshot` — ниже 180 экранных пикселей невыбранная фигура становится снимком.
 */
export function cardLodStyle(
  fill = 'var(--xi-gray-10)',
  options?: { snapshot?: boolean },
): DrLodStyle {
  return resolveLodStyle({
    fill,
    stroke: null,
    strokeWidth: 0,
    ...(options?.snapshot ? { snapshotBelowPx: HEAVY_SHAPE_SNAPSHOT_PX } : {}),
  });
}

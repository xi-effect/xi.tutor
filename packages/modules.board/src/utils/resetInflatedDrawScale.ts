import type { DrShapeId, Editor } from '@ibodr/draw';

const DRAW_LIKE_TYPES = new Set(['draw', 'highlight']);

/**
 * После @ibodr/draw 0.2 штрих пишется с `scale = 1/zoom`, если включён
 * dynamic size. На доске с крупным листом (зум 20–40%) даже XS становится
 * в 3–5 раз толще и сохраняется в Yjs — поэтому ломается и в браузере, и в приложении.
 *
 * Порог 1.5: обычный ресайз рукописи редко больше, а баг зума даёт 2–10.
 */
export const INFLATED_DRAW_SCALE_THRESHOLD = 1.5;

export function isInflatedDrawScale(
  type: string,
  scale: unknown,
  threshold = INFLATED_DRAW_SCALE_THRESHOLD,
): boolean {
  if (!DRAW_LIKE_TYPES.has(type)) return false;
  return typeof scale === 'number' && Number.isFinite(scale) && scale > threshold;
}

export function resetInflatedDrawScale(editor: Editor): number {
  const updates: Array<{ id: DrShapeId; type: 'draw' | 'highlight'; props: { scale: 1 } }> = [];

  for (const shape of editor.getCurrentPageShapes()) {
    if (shape.type !== 'draw' && shape.type !== 'highlight') continue;
    if (!isInflatedDrawScale(shape.type, shape.props.scale)) continue;
    updates.push({ id: shape.id, type: shape.type, props: { scale: 1 } });
  }

  if (updates.length === 0) return 0;
  editor.updateShapes(updates);
  return updates.length;
}

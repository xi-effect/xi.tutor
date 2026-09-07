import type { DrShapeId } from '@ibodr/draw';
import type { FractionModelIntent } from 'features.math';
import { createBoardRectangle, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const CELL = 28;
const GAP = 4;

export function renderFractionModel(
  intent: FractionModelIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const count = Math.min(24, Math.max(1, intent.denominator));
  const filled = Math.min(count, Math.max(0, intent.numerator));

  for (let index = 0; index < count; index += 1) {
    createdShapeIds.push(
      createBoardRectangle(
        context.editor,
        context,
        context.origin.x + index * (CELL + GAP),
        context.origin.y,
        CELL,
        intent.model === 'circle' ? CELL : 36,
      ),
    );
    if (index >= filled) {
      context.editor.updateShape({
        id: createdShapeIds[createdShapeIds.length - 1],
        type: 'xi-geo',
        props: { fill: 'none' },
      });
    }
  }

  createdShapeIds.push(
    createBoardText(
      context.editor,
      context,
      context.origin.x,
      context.origin.y - 28,
      `${intent.numerator}/${intent.denominator}`,
      120,
    ),
  );

  return { createdShapeIds };
}

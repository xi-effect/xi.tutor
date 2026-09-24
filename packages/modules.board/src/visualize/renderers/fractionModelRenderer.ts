import type { DrShapeId } from '@ibodr/draw';
import type { FractionModelIntent } from 'features.math';
import { createBoardRectangle, createBoardSegment, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const CELL = 32;
const BAR_H = 40;

export function renderFractionModel(
  intent: FractionModelIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const count = Math.min(24, Math.max(1, intent.denominator));
  const filled = Math.min(count, Math.max(0, intent.numerator));
  const width = count * CELL;

  createdShapeIds.push(
    createBoardRectangle(context.editor, context, context.origin.x, context.origin.y, width, BAR_H),
  );
  context.editor.updateShape({
    id: createdShapeIds[0],
    type: 'xi-geo',
    props: { fill: 'none' },
  });

  if (filled > 0) {
    createdShapeIds.push(
      createBoardRectangle(
        context.editor,
        context,
        context.origin.x,
        context.origin.y,
        filled * CELL,
        BAR_H,
      ),
    );
  }

  for (let index = 1; index < count; index += 1) {
    const x = index * CELL;
    createdShapeIds.push(
      createBoardSegment(
        context.editor,
        context,
        context.origin.x,
        context.origin.y,
        { x, y: 0 },
        { x, y: BAR_H },
      ),
    );
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

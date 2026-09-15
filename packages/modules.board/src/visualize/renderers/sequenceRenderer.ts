import type { DrShapeId } from '@ibodr/draw';
import type { SequenceIntent } from 'features.math';
import { createBoardArrow, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const STEP = 72;

export function renderSequence(
  intent: SequenceIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const values = intent.values.slice(0, 10);

  values.forEach((value, index) => {
    const x = context.origin.x + index * STEP;
    createdShapeIds.push(
      createBoardText(context.editor, context, x, context.origin.y, String(value), 56),
    );
    if (index < values.length - 1) {
      createdShapeIds.push(
        createBoardArrow(
          context.editor,
          context,
          x + 40,
          context.origin.y + 12,
          { x: 0, y: 0 },
          { x: 24, y: 0 },
        ),
      );
    }
  });

  return { createdShapeIds };
}

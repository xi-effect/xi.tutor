import type { DrShapeId } from '@ibodr/draw';
import type { PercentBarIntent } from 'features.math';
import { createBoardRectangle, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const BAR_W = 240;
const BAR_H = 28;

export function renderPercentBar(
  intent: PercentBarIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const ratio = Math.min(1, Math.max(0, intent.percent / 100));

  createdShapeIds.push(
    createBoardRectangle(context.editor, context, context.origin.x, context.origin.y, BAR_W, BAR_H),
  );
  context.editor.updateShape({
    id: createdShapeIds[0],
    type: 'xi-geo',
    props: { fill: 'none' },
  });

  if (ratio > 0) {
    createdShapeIds.push(
      createBoardRectangle(
        context.editor,
        context,
        context.origin.x,
        context.origin.y,
        Math.max(8, BAR_W * ratio),
        BAR_H,
      ),
    );
  }

  createdShapeIds.push(
    createBoardText(
      context.editor,
      context,
      context.origin.x,
      context.origin.y - 28,
      `${intent.percent}%`,
      80,
    ),
  );

  return { createdShapeIds };
}

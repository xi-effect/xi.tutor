import type { DrShapeId } from '@ibodr/draw';
import type { ProbabilityTreeIntent } from 'features.math';
import { createBoardArrow, createBoardRectangle } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const NODE_W = 120;
const NODE_H = 44;
const GAP_X = 56;
const GAP_Y = 28;

export function renderProbabilityTree(
  intent: ProbabilityTreeIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const outcomes = intent.outcomes.slice(0, 6);
  const startId = createBoardRectangle(
    context.editor,
    context,
    context.origin.x,
    context.origin.y + ((outcomes.length - 1) * (NODE_H + GAP_Y)) / 2,
    NODE_W,
    NODE_H,
    'Старт',
  );
  createdShapeIds.push(startId);

  outcomes.forEach((outcome, index) => {
    const y = context.origin.y + index * (NODE_H + GAP_Y);
    const x = context.origin.x + NODE_W + GAP_X;
    const label =
      outcome.probability != null ? `${outcome.label} (${outcome.probability})` : outcome.label;
    createdShapeIds.push(
      createBoardRectangle(context.editor, context, x, y, NODE_W + 24, NODE_H, label),
    );
    createdShapeIds.push(
      createBoardArrow(
        context.editor,
        context,
        context.origin.x + NODE_W,
        context.origin.y + ((outcomes.length - 1) * (NODE_H + GAP_Y)) / 2 + NODE_H / 2,
        { x: 0, y: 0 },
        {
          x: GAP_X,
          y:
            y +
            NODE_H / 2 -
            (context.origin.y + ((outcomes.length - 1) * (NODE_H + GAP_Y)) / 2 + NODE_H / 2),
        },
      ),
    );
  });

  return { createdShapeIds };
}

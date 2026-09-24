import type { DrShapeId } from '@ibodr/draw';
import type { RatioIntent } from 'features.math';
import { createBoardRectangle, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderContext, VisualizationRenderResult } from './types';

const CELL = 28;
const GAP = 4;

export function renderRatio(
  intent: RatioIntent,
  context: VisualizationRenderContext,
): VisualizationRenderResult {
  const createdShapeIds: DrShapeId[] = [];
  const left = Math.min(12, Math.max(1, Math.round(intent.left)));
  const right = Math.min(12, Math.max(1, Math.round(intent.right)));

  for (let index = 0; index < left; index += 1) {
    createdShapeIds.push(
      createBoardRectangle(
        context.editor,
        context,
        context.origin.x + index * (CELL + GAP),
        context.origin.y,
        CELL,
        CELL,
      ),
    );
  }

  const rightStart = context.origin.x + left * (CELL + GAP) + 16;
  for (let index = 0; index < right; index += 1) {
    createdShapeIds.push(
      createBoardRectangle(
        context.editor,
        context,
        rightStart + index * (CELL + GAP),
        context.origin.y,
        CELL,
        CELL,
      ),
    );
  }

  createdShapeIds.push(
    createBoardText(
      context.editor,
      context,
      context.origin.x,
      context.origin.y - 28,
      `${intent.left} : ${intent.right}`,
      140,
    ),
  );

  return { createdShapeIds };
}

import type { DrShapeId } from '@ibodr/draw';
import type { TimelineIntent } from '../intent/schemas';
import { createBoardArrow, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderer } from './types';

const STEP = 180;

export const timelineRenderer: VisualizationRenderer<TimelineIntent> = {
  render(intent, context) {
    const createdShapeIds: DrShapeId[] = [];
    const width = Math.max(1, intent.events.length - 1) * STEP;

    createdShapeIds.push(
      createBoardArrow(
        context.editor,
        context,
        context.origin.x,
        context.origin.y + 40,
        { x: 0, y: 0 },
        { x: width + 40, y: 0 },
      ),
    );

    intent.events.forEach((event, index) => {
      const x = context.origin.x + index * STEP;
      createdShapeIds.push(
        createBoardText(context.editor, context, x, context.origin.y, event.year, 80),
      );
      createdShapeIds.push(
        createBoardText(context.editor, context, x, context.origin.y + 52, event.label, 160),
      );
    });

    return { createdShapeIds };
  },
};

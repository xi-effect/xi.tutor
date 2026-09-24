import type { DrShapeId } from '@ibodr/draw';
import type { NumberLineIntent } from '../intent/schemas';
import { createBoardArrow, createBoardEllipse, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderer } from './types';

const UNIT = 48;
const LINE_Y = 40;

function valuesFromIntent(intent: NumberLineIntent): number[] {
  const values: number[] = [];
  if (intent.start) values.push(intent.start.value);
  if (intent.end) values.push(intent.end.value);
  if (values.length === 0) return [-5, 5];
  const min = Math.min(...values);
  const max = Math.max(...values);
  return [min - 2, max + 2];
}

export const numberLineRenderer: VisualizationRenderer<NumberLineIntent> = {
  render(intent, context) {
    const { editor } = context;
    const [min, max] = valuesFromIntent(intent);
    const span = Math.max(1, max - min);
    const width = span * UNIT;
    const createdShapeIds: DrShapeId[] = [];

    createdShapeIds.push(
      createBoardArrow(
        editor,
        context,
        context.origin.x,
        context.origin.y + LINE_Y,
        { x: 0, y: 0 },
        { x: width + 24, y: 0 },
      ),
    );

    const toX = (value: number) => context.origin.x + (value - min) * UNIT;

    for (let tick = Math.ceil(min); tick <= Math.floor(max); tick += 1) {
      createdShapeIds.push(
        createBoardText(
          editor,
          context,
          toX(tick) - 8,
          context.origin.y + LINE_Y + 10,
          String(tick),
          40,
        ),
      );
    }

    const intervalStart = intent.start?.value ?? min;
    const intervalEnd = intent.end?.value ?? max;
    const startX = toX(intervalStart);
    const endX = toX(intervalEnd);

    if (intent.start || intent.end || intent.unboundedLeft || intent.unboundedRight) {
      createdShapeIds.push(
        createBoardArrow(
          editor,
          context,
          startX,
          context.origin.y + LINE_Y,
          { x: 0, y: 0 },
          { x: Math.max(24, endX - startX), y: 0 },
        ),
      );
    }

    if (intent.start) {
      createdShapeIds.push(
        createBoardEllipse(
          editor,
          context,
          startX - 7,
          context.origin.y + LINE_Y - 7,
          14,
          intent.start.inclusive ? 'solid' : 'none',
        ),
      );
    }
    if (intent.end) {
      createdShapeIds.push(
        createBoardEllipse(
          editor,
          context,
          endX - 7,
          context.origin.y + LINE_Y - 7,
          14,
          intent.end.inclusive ? 'solid' : 'none',
        ),
      );
    }

    return { createdShapeIds };
  },
};

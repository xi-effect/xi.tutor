import { createShapeId, DefaultColorStyle, DefaultSizeStyle, type DrShapeId } from '@ibodr/draw';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
} from '../../shapes/coordinate-axes/CoordinateAxesShape';
import { getPlotArea, mathToPixel } from '../../shapes/coordinate-axes/utils/coordinateMapping';
import type { CoordinatePointsIntent } from '../intent/schemas';
import { createBoardArrow, createBoardEllipse, createBoardText } from './createBoardPrimitives';
import type { VisualizationRenderer } from './types';

const POINT_SIZE = 12;

function paddedRange(values: number[], fallback: [number, number]): [number, number] {
  if (values.length === 0) return fallback;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [min - 2, max + 2];
  }
  const pad = Math.max(1, (max - min) * 0.25);
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

export const coordinatePointsRenderer: VisualizationRenderer<CoordinatePointsIntent> = {
  render(intent, context) {
    const { editor } = context;
    const xs = intent.points.map((point) => point.x);
    const ys = intent.points.map((point) => point.y);
    const xRange = intent.xRange ?? paddedRange(xs, [-5, 5]);
    const yRange = intent.yRange ?? paddedRange(ys, [-5, 5]);
    const w = COORDINATE_AXES_DEFAULT_WIDTH;
    const h = COORDINATE_AXES_DEFAULT_HEIGHT;
    const axesId = createShapeId();

    editor.createShape({
      id: axesId,
      type: 'coordinate-axes',
      x: context.origin.x,
      y: context.origin.y,
      parentId: context.parentId,
      props: {
        w,
        h,
        xMin: xRange[0],
        xMax: xRange[1],
        yMin: yRange[0],
        yMax: yRange[1],
        xDivisions: 10,
        yDivisions: 10,
        showLabels: true,
        equation: '',
        color: editor.getStyleForNextShape(DefaultColorStyle),
        plotColor: 'blue',
        size: editor.getStyleForNextShape(DefaultSizeStyle),
      },
    });

    const plot = getPlotArea(w, h);
    const createdShapeIds: DrShapeId[] = [axesId];
    const pixelPoints: Array<{ px: number; py: number }> = [];

    for (const point of intent.points) {
      const { px, py } = mathToPixel(
        point.x,
        point.y,
        { xMin: xRange[0], xMax: xRange[1], yMin: yRange[0], yMax: yRange[1] },
        plot,
      );
      pixelPoints.push({ px, py });
      createdShapeIds.push(
        createBoardEllipse(
          editor,
          context,
          context.origin.x + px - POINT_SIZE / 2,
          context.origin.y + py - POINT_SIZE / 2,
          POINT_SIZE,
        ),
      );
      if (point.name) {
        createdShapeIds.push(
          createBoardText(
            editor,
            context,
            context.origin.x + px + 8,
            context.origin.y + py - 22,
            point.name,
            80,
          ),
        );
      }
    }

    if (intent.connect) {
      for (let index = 0; index < pixelPoints.length - 1; index += 1) {
        const from = pixelPoints[index];
        const to = pixelPoints[index + 1];
        createdShapeIds.push(
          createBoardArrow(
            editor,
            context,
            context.origin.x + from.px,
            context.origin.y + from.py,
            { x: 0, y: 0 },
            { x: to.px - from.px, y: to.py - from.py },
          ),
        );
      }
    }

    return { createdShapeIds };
  },
};

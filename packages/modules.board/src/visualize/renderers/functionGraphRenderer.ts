import {
  createShapeId,
  DefaultColorStyle,
  DefaultSizeStyle,
  type DrShapeId,
  type Editor,
} from '@ibodr/draw';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
  type CoordinateAxesShape,
} from '../../shapes/coordinate-axes/CoordinateAxesShape';
import { commitEquationForShape } from '../../shapes/coordinate-axes/utils/commitEquationForShape';
import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';
import { getFunctionGraphExpressions, type FunctionGraphIntent } from '../intent/schemas';
import { inferFunctionGraphRange } from './autoFunctionRange';
import type { VisualizationRenderContext, VisualizationRenderer } from './types';

const PLOT_COLORS = ['blue', 'red', 'green', 'orange', 'violet'] as const;

function createAxes(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  equation: string,
  extraEquations: string[],
  plotColor: (typeof PLOT_COLORS)[number],
  range: { xMin: number; xMax: number; yMin: number; yMax: number },
): DrShapeId | null {
  const id = createShapeId();
  const color = editor.getStyleForNextShape(DefaultColorStyle);
  const size = editor.getStyleForNextShape(DefaultSizeStyle);

  editor.createShape({
    id,
    type: 'coordinate-axes',
    x,
    y,
    parentId: context.parentId,
    props: {
      w: COORDINATE_AXES_DEFAULT_WIDTH,
      h: COORDINATE_AXES_DEFAULT_HEIGHT,
      xMin: range.xMin,
      xMax: range.xMax,
      yMin: range.yMin,
      yMax: range.yMax,
      xDivisions: 10,
      yDivisions: 10,
      showLabels: true,
      equation: '',
      extraEquations: extraEquations.join('\n'),
      color,
      plotColor,
      size,
    },
  });

  const committed = commitEquationForShape(editor, id, equation);
  if (!committed.ok) {
    editor.deleteShape(id);
    return null;
  }

  return id;
}

function findSelectedOrNearbyAxes(
  editor: Editor,
  context: VisualizationRenderContext,
): CoordinateAxesShape | null {
  const selected = editor
    .getSelectedShapes()
    .find(
      (shape): shape is CoordinateAxesShape => shape.type === 'coordinate-axes' && !shape.isLocked,
    );
  if (selected) return selected;

  const nearby = editor
    .getCurrentPageShapes()
    .filter(
      (shape): shape is CoordinateAxesShape =>
        shape.type === 'coordinate-axes' && !shape.isLocked && shape.props.equation.trim() === '',
    )
    .map((shape) => {
      const bounds = editor.getShapePageBounds(shape.id);
      if (!bounds) return null;
      const dx = bounds.x - context.origin.x;
      const dy = bounds.y - context.origin.y;
      return { shape, distance: Math.hypot(dx, dy) };
    })
    .filter((item): item is { shape: CoordinateAxesShape; distance: number } => item !== null)
    .sort((left, right) => left.distance - right.distance)[0];

  if (nearby && nearby.distance < 180) return nearby.shape;
  return null;
}

export const functionGraphRenderer: VisualizationRenderer<FunctionGraphIntent> = {
  render(intent, context) {
    const expressions = getFunctionGraphExpressions(intent);
    if (expressions.length === 0) return { createdShapeIds: [] };

    const { editor } = context;
    const extras = expressions.slice(1).filter((expression) => evaluateEquation(expression).ok);
    const range = inferFunctionGraphRange(expressions, intent);
    const reusable = expressions.length === 1 ? findSelectedOrNearbyAxes(editor, context) : null;

    if (reusable) {
      const committed = commitEquationForShape(editor, reusable.id, expressions[0]);
      if (!committed.ok) {
        return { createdShapeIds: [] };
      }
      editor.updateShape({
        id: reusable.id,
        type: 'coordinate-axes',
        props: {
          extraEquations: extras.join('\n'),
          xMin: range.xMin,
          xMax: range.xMax,
          yMin: range.yMin,
          yMax: range.yMax,
        },
      });
      return { createdShapeIds: [reusable.id] };
    }

    const id = createAxes(
      editor,
      context,
      context.origin.x,
      context.origin.y,
      expressions[0],
      extras,
      PLOT_COLORS[0],
      range,
    );
    return { createdShapeIds: id ? [id] : [] };
  },
};

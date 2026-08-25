import { createShapeId, DefaultColorStyle, DefaultSizeStyle, type Editor } from '@ibodr/draw';
import { MathFigureKindStyle } from '../shapeStyles';
import { getMathFigureDefaultProps } from './MathFigureShape';
import type { MathFigureKind } from './utils/kinds';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
} from '../coordinate-axes/CoordinateAxesShape';

export type BoardTemplateId = MathFigureKind | 'axes' | 'vector';

function getViewportCenter(editor: Editor): { x: number; y: number } {
  const bounds = editor.getViewportPageBounds();
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  };
}

function insertMathFigure(editor: Editor, kind: MathFigureKind) {
  const props = getMathFigureDefaultProps(kind);
  const center = getViewportCenter(editor);
  const id = createShapeId();
  const color = editor.getStyleForNextShape(DefaultColorStyle);
  const size = editor.getStyleForNextShape(DefaultSizeStyle);

  editor.createShape({
    id,
    type: 'math-figure',
    x: center.x - props.w / 2,
    y: center.y - props.h / 2,
    props: {
      ...props,
      color,
      size,
    },
  });
  editor.setSelectedShapes([id]);
  editor.setCurrentTool('select');
}

function insertCoordinateAxes(editor: Editor) {
  const center = getViewportCenter(editor);
  const w = COORDINATE_AXES_DEFAULT_WIDTH;
  const h = COORDINATE_AXES_DEFAULT_HEIGHT;
  const id = createShapeId();
  const color = editor.getStyleForNextShape(DefaultColorStyle);
  const size = editor.getStyleForNextShape(DefaultSizeStyle);

  editor.createShape({
    id,
    type: 'coordinate-axes',
    x: center.x - w / 2,
    y: center.y - h / 2,
    props: {
      w,
      h,
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xDivisions: 10,
      yDivisions: 10,
      showLabels: true,
      equation: '',
      color,
      plotColor: 'blue',
      size,
    },
  });
  editor.setSelectedShapes([id]);
  editor.setCurrentTool('select');
}

function insertVector(editor: Editor) {
  const center = getViewportCenter(editor);
  const id = createShapeId();
  const color = editor.getStyleForNextShape(DefaultColorStyle);
  const size = editor.getStyleForNextShape(DefaultSizeStyle);
  const defaults = editor.getShapeUtil('arrow').getDefaultProps();

  editor.createShape({
    id,
    type: 'arrow',
    x: center.x - 80,
    y: center.y,
    props: {
      ...defaults,
      color,
      size,
      start: { x: 0, y: 0 },
      end: { x: 160, y: 0 },
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow',
      kind: 'arc',
      bend: 0,
    },
  });
  editor.setSelectedShapes([id]);
  editor.setCurrentTool('select');
}

export function prepareMathFigureTool(editor: Editor, kind: MathFigureKind) {
  editor.setStyleForNextShapes(MathFigureKindStyle, kind);
  editor.setCurrentTool('math-figure');
}

export function insertBoardTemplate(editor: Editor, templateId: BoardTemplateId) {
  editor.run(() => {
    switch (templateId) {
      case 'axes':
        insertCoordinateAxes(editor);
        return;
      case 'vector':
        insertVector(editor);
        return;
      default:
        insertMathFigure(editor, templateId);
        return;
    }
  });
}

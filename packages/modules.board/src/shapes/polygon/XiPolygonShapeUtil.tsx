import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  Polygon2d,
  ShapeUtil,
  T,
  Vec,
  getColorValue,
  type DrBaseShape,
  type DrHandle,
  type DrHandleDragInfo,
  type DrResizeInfo,
} from '@ibodr/draw';
import { BorderColorStyle } from '../shapeStyles';
import { getFillColor, getSizeInPixels } from '../geo/geoUtils';
import { resolveLodStyle } from '../../utils/resolveLodStyle';
import type { TColor, TFill, TSize } from '../../types';
import { moveTrapezoidVertex, moveTriangleVertex, type Pt } from './polygonGeometry';
import { polygonDashArray } from './polygonDash';
import { PolygonShapeView } from './PolygonShapeView';

export type XiPolygonKind = 'triangle' | 'trapezoid';

export type XiPolygonShapeProps = {
  kind: XiPolygonKind;
  vertices: Pt[];
  color: TColor;
  fill: TFill;
  size: TSize;
  dash: string;
  borderColor: TColor | 'none';
};

const vertexValidator = T.object({
  x: T.number,
  y: T.number,
});

export const xiPolygonShapeProps = {
  kind: T.literalEnum('triangle', 'trapezoid'),
  vertices: T.arrayOf(vertexValidator),
  color: DefaultColorStyle,
  fill: DefaultFillStyle,
  size: DefaultSizeStyle,
  dash: DefaultDashStyle,
  borderColor: BorderColorStyle,
};

export type XiPolygonShape = DrBaseShape<'xi-polygon', XiPolygonShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'xi-polygon': XiPolygonShapeProps;
  }
}

export class XiPolygonShapeUtil extends ShapeUtil<XiPolygonShape> {
  static override type = 'xi-polygon' as const;
  static override props = xiPolygonShapeProps;

  override getDefaultProps(): XiPolygonShapeProps {
    return {
      kind: 'triangle',
      vertices: [
        { x: 0, y: 80 },
        { x: 100, y: 80 },
        { x: 40, y: 0 },
      ],
      color: 'black',
      fill: 'semi',
      size: 'm',
      dash: 'draw',
      borderColor: 'black',
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return false;
  }

  override hideRotateHandle() {
    return false;
  }

  override getGeometry(shape: XiPolygonShape) {
    return new Polygon2d({
      points: shape.props.vertices.map((vertex) => new Vec(vertex.x, vertex.y)),
      isFilled: true,
    });
  }

  override getHandles(shape: XiPolygonShape): DrHandle[] {
    return shape.props.vertices.map((vertex, index) => ({
      id: String(index),
      type: 'vertex',
      index: `a${index + 1}` as DrHandle['index'],
      x: vertex.x,
      y: vertex.y,
    }));
  }

  override onHandleDrag(shape: XiPolygonShape, info: DrHandleDragInfo<XiPolygonShape>) {
    const index = Number(info.handle.id);
    if (!Number.isInteger(index)) return;

    // Координата ручки задана в системе фигуры на старте жеста. Нельзя сдвигать x/y
    // по ходу перетаскивания: иначе следующий кадр применит ту же точку к уже сдвинутым вершинам.
    const base = info.initial ?? shape;
    const nextPoint = { x: info.handle.x, y: info.handle.y };
    const vertices =
      base.props.kind === 'trapezoid'
        ? moveTrapezoidVertex(base.props.vertices, index, nextPoint)
        : moveTriangleVertex(base.props.vertices, index, nextPoint);

    return {
      id: shape.id,
      type: shape.type,
      props: { vertices: vertices ?? base.props.vertices },
    };
  }

  override onResize(_shape: XiPolygonShape, info: DrResizeInfo<XiPolygonShape>) {
    // Масштаб считается от исходных вершин. Положение фигуры выставляет сам редактор.
    const vertices = info.initialShape.props.vertices.map((vertex) => ({
      x: vertex.x * info.scaleX,
      y: vertex.y * info.scaleY,
    }));
    return { props: { vertices } };
  }

  override getIndicatorPath(shape: XiPolygonShape) {
    const path = new Path2D();
    const [first, ...rest] = shape.props.vertices;
    if (!first) return path;
    path.moveTo(first.x, first.y);
    for (const vertex of rest) path.lineTo(vertex.x, vertex.y);
    path.closePath();
    return path;
  }

  override getLodStyle(shape: XiPolygonShape) {
    const theme = this.editor.getCurrentTheme();
    const colors = theme.colors[this.editor.getColorMode()];
    const border = shape.props.borderColor === 'none' ? null : shape.props.borderColor;
    const strokeWidth = border ? getSizeInPixels(shape.props.size) : 0;
    return resolveLodStyle({
      fill: getFillColor(colors, shape.props.fill, shape.props.color),
      stroke: border ? getColorValue(colors, border, 'solid') : 'transparent',
      strokeWidth,
    });
  }

  override component(shape: XiPolygonShape) {
    return <PolygonShapeView shape={shape} />;
  }

  override toSvg(shape: XiPolygonShape) {
    const theme = this.editor.getCurrentTheme();
    const colors = theme.colors[this.editor.getColorMode()];
    const border = shape.props.borderColor === 'none' ? null : shape.props.borderColor;
    const strokeWidth = border ? getSizeInPixels(shape.props.size) : 0;
    const points = shape.props.vertices.map((vertex) => `${vertex.x},${vertex.y}`).join(' ');
    return (
      <polygon
        points={points}
        fill={getFillColor(colors, shape.props.fill, shape.props.color)}
        stroke={border ? getColorValue(colors, border, 'solid') : 'none'}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeDasharray={polygonDashArray(shape.props.dash, strokeWidth)}
      />
    );
  }
}

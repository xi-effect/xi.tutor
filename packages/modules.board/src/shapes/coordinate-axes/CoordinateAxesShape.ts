import { DefaultColorStyle, DefaultSizeStyle, T, DrBaseShape } from '@ibodr/draw';
import { PlotColorStyle } from '../shapeStyles';

export const COORDINATE_AXES_DEFAULT_WIDTH = 400;
export const COORDINATE_AXES_DEFAULT_HEIGHT = 400;
export const COORDINATE_AXES_MIN_SIZE = 160;

export type CoordinateAxesShapeProps = {
  w: number;
  h: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xDivisions: number;
  yDivisions: number;
  /** @deprecated Сетка всегда отображается; поле оставлено для совместимости со старыми досками. */
  showGrid?: boolean;
  showLabels: boolean;
  equation: string;
  color: typeof DefaultColorStyle.defaultValue;
  plotColor: typeof PlotColorStyle.defaultValue;
  size: typeof DefaultSizeStyle.defaultValue;
};

const plotColorValidator = {
  validate(value: unknown): typeof PlotColorStyle.defaultValue {
    if (value === undefined || value === null) return PlotColorStyle.defaultValue;
    return PlotColorStyle.validate(value);
  },
  validateUsingKnownGoodVersion(
    _knownGood: typeof PlotColorStyle.defaultValue,
    value: unknown,
  ): typeof PlotColorStyle.defaultValue {
    if (value === undefined || value === null) return PlotColorStyle.defaultValue;
    return PlotColorStyle.validate(value);
  },
};

export const coordinateAxesShapeProps = {
  w: T.number,
  h: T.number,
  xMin: T.number,
  xMax: T.number,
  yMin: T.number,
  yMax: T.number,
  xDivisions: T.number,
  yDivisions: T.number,
  showGrid: T.boolean.optional(),
  showLabels: T.boolean,
  equation: T.string,
  color: DefaultColorStyle,
  plotColor: plotColorValidator,
  size: DefaultSizeStyle,
};

export type CoordinateAxesShape = DrBaseShape<'coordinate-axes', CoordinateAxesShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'coordinate-axes': CoordinateAxesShapeProps;
  }
}

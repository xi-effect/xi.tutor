import { DefaultColorStyle, DefaultSizeStyle, T, DrBaseShape } from '@ibodr/draw';
import { MathFigureKindStyle } from '../shapeStyles';
import {
  MATH_FIGURE_DEFAULT_SIZE,
  kindHasHeight,
  kindHasHiddenEdges,
  type MathFigureKind,
} from './utils/kinds';

export type MathFigureShapeProps = {
  w: number;
  h: number;
  kind: MathFigureKind;
  showHiddenEdges: boolean;
  showLabels: boolean;
  showHeight: boolean;
  showMedian: boolean;
  showBisector: boolean;
  color: typeof DefaultColorStyle.defaultValue;
  size: typeof DefaultSizeStyle.defaultValue;
};

/** Старые доски могли не содержать поле — подставляем default при валидации Yjs-снимка. */
function booleanWithDefault(defaultValue: boolean) {
  return {
    validate(value: unknown): boolean {
      if (value === undefined || value === null) return defaultValue;
      return T.boolean.validate(value);
    },
    validateUsingKnownGoodVersion(_knownGood: boolean, value: unknown): boolean {
      if (value === undefined || value === null) return defaultValue;
      return T.boolean.validate(value);
    },
  };
}

export const mathFigureShapeProps = {
  w: T.number,
  h: T.number,
  kind: MathFigureKindStyle,
  showHiddenEdges: T.boolean,
  showLabels: T.boolean,
  showHeight: T.boolean,
  showMedian: booleanWithDefault(false),
  showBisector: booleanWithDefault(false),
  color: DefaultColorStyle,
  size: DefaultSizeStyle,
};

export type MathFigureShape = DrBaseShape<'math-figure', MathFigureShapeProps>;

export function getMathFigureDefaultProps(kind: MathFigureKind = 'cube'): MathFigureShapeProps {
  const { w, h } = MATH_FIGURE_DEFAULT_SIZE[kind];
  return {
    w,
    h,
    kind,
    showHiddenEdges: kindHasHiddenEdges(kind),
    showLabels: true,
    showHeight: kindHasHeight(kind),
    showMedian: false,
    showBisector: false,
    color: 'black',
    size: 'm',
  };
}

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'math-figure': MathFigureShapeProps;
  }
}

import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
  DefaultVerticalAlignStyle,
  GeoShapeGeoStyle,
  GeoShapeUtil,
  HTMLContainer,
  PlainTextLabel,
  SVGContainer,
  T,
  TLDefaultColorTheme,
  TLGeoShape,
  TLPropsMigrations,
  TLRichText,
  useDefaultColorTheme,
} from 'tldraw';
import { BorderColorStyle } from '../shapeStyles';
import { TAlign, TColor, TDash, TFill, TFont, TSize, TGeoShape, TVerticalAlign } from '../../types';

type TXiGeoShapeProps = {
  geo: TGeoShape;
  w: number;
  h: number;
  richText?: TLRichText;
  color: TColor;
  labelColor: TColor;
  fill: TFill;
  dash: TDash;
  size: TSize;
  font: TFont;
  align: TAlign;
  verticalAlign: TVerticalAlign;
  growY: number;
  url: string;
  scale: number;
  borderColor: TColor;
  text: string;
};

declare module 'tldraw' {
  export interface TLGlobalShapePropsMap {
    'xi-geo': {
      borderColor: TColor;
    };
  }
}

const DEFAULT_SIZE_SCALE = 0.6;

export class XiGeoShapeUtil extends GeoShapeUtil {
  static override type = 'xi-geo' as 'geo';
  static override migrations: TLPropsMigrations;

  static override props = {
    geo: GeoShapeGeoStyle,
    w: T.number,
    h: T.number,
    richText: T.any,
    color: DefaultColorStyle,
    labelColor: T.literalEnum(DefaultColorStyle.defaultValue),
    fill: DefaultFillStyle,
    dash: DefaultDashStyle,
    size: DefaultSizeStyle,
    font: DefaultFontStyle,
    align: DefaultTextAlignStyle,
    verticalAlign: DefaultVerticalAlignStyle,
    growY: T.number,
    url: T.string,
    scale: T.number,
    borderColor: BorderColorStyle,
    text: T.string,
  };

  getDefaultProps() {
    const defaultProps = super.getDefaultProps();
    return {
      ...defaultProps,
      borderColor: 'black',
      text: '',
    };
  }

  override component(shape: TLGeoShape) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useDefaultColorTheme();
    const { borderColor, color, fill, size, text, w, h } = shape.props as TXiGeoShapeProps;

    const geometry = this.editor.getShapeGeometry(shape);
    const pathData = geometry.getSvgPathData(false);
    const fillColor = this.getFillColor(theme, fill, color);
    const strokeWidth = this.getSizeInPixels(size);

    return (
      <HTMLContainer
        className="relative flex items-center justify-center"
        style={{
          width: w,
          height: h,
        }}
      >
        <SVGContainer>
          {pathData && (
            <path
              d={pathData}
              fill={fillColor}
              stroke={theme[borderColor].fill}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          )}
        </SVGContainer>
        <div
          className="absolute z-10 overflow-hidden"
          style={{
            width: w * DEFAULT_SIZE_SCALE,
            height: h * DEFAULT_SIZE_SCALE,
          }}
        >
          <PlainTextLabel
            type="xi-geo"
            shapeId={shape.id}
            font="draw"
            fontSize={16}
            lineHeight={2}
            align="middle"
            verticalAlign="middle"
            isSelected
            labelColor={shape.props.labelColor}
            text={text}
          />
        </div>
      </HTMLContainer>
    );
  }

  private getFillColor(theme: TLDefaultColorTheme, fill: TFill, color: TColor): string {
    if (fill === 'solid') return theme[color].solid;
    if (fill === 'semi') return theme[color].semi;

    return 'transparent';
  }

  private getSizeInPixels(size: TSize): number {
    if (size === 'xl') return 20;
    if (size === 'l') return 16;
    if (size === 'm') return 10;

    return 6;
  }
}

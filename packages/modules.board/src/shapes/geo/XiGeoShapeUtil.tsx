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
  T,
  DrGeoShape,
} from '@ibodr/draw';
import { BorderColorStyle } from '../shapeStyles';
import { XiGeoComponent } from './XiGeoComponent';
import type { XiGeoShape } from './type';
import { xiGeoShapeMigrations } from './xiGeoShapeMigrations';

// GeoShapeUtil типизирован как type 'geo'; runtime использует 'xi-geo'.
// @ts-expect-error кастомный geo-подтип с расширенными props
export class XiGeoShapeUtil extends GeoShapeUtil {
  static override type = 'xi-geo' as const;

  static override migrations = xiGeoShapeMigrations;

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

  override component(shape: DrGeoShape) {
    return <XiGeoComponent shape={shape as unknown as XiGeoShape} />;
  }
}

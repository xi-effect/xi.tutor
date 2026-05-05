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
  TLGeoShape,
  TLPropsMigrations,
} from 'tldraw';
import { BorderColorStyle } from '../shapeStyles';
import { TColor } from '../../types';
import { XiGeoComponent } from './XiGeoComponent';

declare module 'tldraw' {
  export interface TLGlobalShapePropsMap {
    'xi-geo': {
      borderColor: TColor;
    };
  }
}

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
    return <XiGeoComponent shape={shape} />;
  }
}

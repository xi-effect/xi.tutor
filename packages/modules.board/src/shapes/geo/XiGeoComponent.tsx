import {
  HTMLContainer,
  PlainTextLabel,
  SVGContainer,
  TLGeoShape,
  useDefaultColorTheme,
  useEditor,
} from 'tldraw';
import { getFillColor, getSizeInPixels } from './geoUtils';
import { TXiGeoShapeProps } from './type';

type TXiGeoComponent = {
  shape: TLGeoShape;
};

const DEFAULT_SIZE_SCALE = 0.6;

export const XiGeoComponent: React.FC<TXiGeoComponent> = ({ shape }) => {
  const editor = useEditor();
  const theme = useDefaultColorTheme();
  const { borderColor, color, fill, size, text, w, h } = shape.props as TXiGeoShapeProps;

  const geometry = editor.getShapeGeometry(shape);
  const pathData = geometry.getSvgPathData(false);
  const fillColor = getFillColor(theme, fill, color);
  const strokeWidth = getSizeInPixels(size);

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
};

import {
  HTMLContainer,
  SVGContainer,
  getColorValue,
  getFontFamily,
  useEditor,
  useValue,
} from '@ibodr/draw';
import { BoardPlainTextLabel } from '../labels/BoardPlainTextLabel';
import { getFillColor, getSizeInPixels } from './geoUtils';
import type { XiGeoShape, TXiGeoShapeProps } from './type';

type TXiGeoComponent = {
  shape: XiGeoShape;
};

const DEFAULT_SIZE_SCALE = 0.6;

export const XiGeoComponent: React.FC<TXiGeoComponent> = ({ shape }) => {
  const editor = useEditor();
  const theme = useValue('theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor]);
  const colors = theme.colors[colorMode];
  const isSelected = useValue('isSelected', () => editor.getOnlySelectedShapeId() === shape.id, [
    editor,
    shape.id,
  ]);
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === shape.id, [
    editor,
    shape.id,
  ]);

  const { borderColor, color, fill, size, text, w, h, labelColor, font, align, verticalAlign } =
    shape.props as TXiGeoShapeProps;

  const geometry = editor.getShapeGeometry(shape);
  const pathData = geometry.getSvgPathData(false);
  const fillColor = getFillColor(colors, fill, color);
  const strokeWidth = getSizeInPixels(size);
  const strokeColor = getColorValue(colors, borderColor, 'fill');
  const textColor = getColorValue(colors, labelColor, 'solid');

  const textAlign = align === 'middle' ? 'center' : align === 'end' ? 'end' : 'start';
  const vAlign = verticalAlign === 'middle' ? 'middle' : verticalAlign === 'end' ? 'end' : 'start';

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
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        )}
      </SVGContainer>
      <div
        className="absolute z-10"
        style={{
          width: w * DEFAULT_SIZE_SCALE,
          height: h * DEFAULT_SIZE_SCALE,
          overflow: isEditing ? 'visible' : 'hidden',
        }}
      >
        <BoardPlainTextLabel
          type="xi-geo"
          shapeId={shape.id}
          fontFamily={getFontFamily(theme, font ?? 'draw')}
          fontSize={theme.fontSize}
          lineHeight={theme.lineHeight}
          textAlign={textAlign}
          verticalAlign={vAlign}
          isSelected={isSelected}
          labelColor={textColor}
          text={text}
        />
      </div>
    </HTMLContainer>
  );
};

import {
  DrRichText,
  HTMLContainer,
  RichTextArea,
  RichTextLabel,
  SVGContainer,
  getColorValue,
  getFontFamily,
  toRichText,
  useEditor,
  useValue,
} from '@ibodr/draw';
import { getFillColor, getSizeInPixels } from './geoUtils';
import type { XiGeoShape, XiGeoShapeProps } from './type';

type XiGeoComponentT = {
  shape: XiGeoShape;
};

type RichTextChangeDataT = {
  richText: DrRichText;
};

const DEFAULT_SIZE_SCALE = 0.6;

export const XiGeoComponent: React.FC<XiGeoComponentT> = ({ shape }) => {
  const editor = useEditor();
  const { borderColor, color, fill, size, text, w, h, labelColor, font, richText } =
    shape.props as XiGeoShapeProps;

  // Логика для обратной совместимости со старыми фигурами
  // Проверяем есть ли контент в text, если он есть, значит фигуру ранее не использовали с richText,
  // если контент в text есть, то ставим text в richText, а text удаляем.
  if (text) {
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        richText: toRichText(text),
        text: '', // для обратной совместимости со старыми фигурами
      },
    });
  }

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

  const geometry = editor.getShapeGeometry(shape);
  const pathData = geometry.getSvgPathData(false);
  const fillColor = getFillColor(colors, fill, color);
  const strokeWidth = getSizeInPixels(size);
  const strokeColor = getColorValue(colors, borderColor, 'fill');
  const textColor = getColorValue(colors, labelColor, 'solid');

  // Устанавливаем текст в фигуру;
  const changeRichTextHandle = ({ richText }: RichTextChangeDataT) => {
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        richText,
      },
    });
  };

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
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {isEditing ? (
          <RichTextArea
            shapeId={shape.id}
            handleChange={changeRichTextHandle}
            handleBlur={() => {}}
            handlePaste={() => {}}
            handleDoubleClick={() => {}}
            handleFocus={() => {}}
            handleInputPointerDown={() => {}}
            handleKeyDown={() => {}}
            isEditing
            richText={richText}
          />
        ) : (
          <RichTextLabel
            richText={richText}
            type="xi-geo"
            shapeId={shape.id}
            fontSize={theme.fontSize}
            fontFamily={getFontFamily(theme, font ?? 'draw')}
            lineHeight={theme.lineHeight}
            textAlign="center"
            verticalAlign="middle"
            isSelected={isSelected}
            labelColor={textColor}
            hasCustomTabBehavior
          />
        )}
      </div>
    </HTMLContainer>
  );
};

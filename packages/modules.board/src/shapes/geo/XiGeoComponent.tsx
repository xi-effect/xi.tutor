import {
  DrRichText,
  HTMLContainer,
  RichTextArea,
  RichTextLabel,
  SVGContainer,
  getColorValue,
  getFontFamily,
  renderPlaintextFromRichText,
  toRichText,
  useEditor,
  useValue,
} from '@ibodr/draw';
import { getFillColor, getSizeInPixels } from './geoUtils';
import type { XiGeoShape, XiGeoShapeProps } from './type';
import { useState } from 'react';

type TXiGeoComponent = {
  shape: XiGeoShape;
};

type TRichTextChangeData = {
  richText: DrRichText;
};

const DEFAULT_SIZE_SCALE = 0.6;

export const XiGeoComponent: React.FC<TXiGeoComponent> = ({ shape }) => {
  const editor = useEditor();
  const { borderColor, color, fill, size, text, w, h, labelColor, font, richText } =
    shape.props as XiGeoShapeProps;

  // Проверяем есть ли контент в richText, если он есть, значит фигуру ранее использовали с richText
  // если контент в richText пустой, то используем тtext для обратной совместимости со старыми фигурами
  const fallbackRichText = renderPlaintextFromRichText(editor, richText)
    ? richText
    : toRichText(text);

  const [currentRichText, setCurrentRichText] = useState<DrRichText>(fallbackRichText);
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
  const handleRichTextChange = ({ richText }: TRichTextChangeData) => {
    editor.updateShape({
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        richText,
        text: '', // для обратной совместимости со старыми фигурами
      },
    });
    setCurrentRichText(richText);
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
          pointerEvents: isEditing ? 'auto' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {isEditing ? (
          <RichTextArea
            shapeId={shape.id}
            handleChange={handleRichTextChange}
            handleBlur={() => {}}
            handlePaste={() => {}}
            handleDoubleClick={() => {}}
            handleFocus={() => {}}
            handleInputPointerDown={() => {}}
            handleKeyDown={() => {}}
            isEditing
            richText={currentRichText}
          />
        ) : (
          <RichTextLabel
            richText={currentRichText}
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

import { Fragment, useCallback } from 'react';
import {
  DrawUiTooltip,
  getDisplayValues,
  NoteShapeUtil,
  renderPlaintextFromRichText,
  RichTextLabel,
  useEditor,
  useValue,
  type DrNoteShape,
} from '@ibodr/draw';
import { EmptyLabelCaret } from '../labels/EmptyLabelCaret';
import { startLabelEditing } from '../labels/startLabelEditing';
import { getStickerNoteHeight, getStickerNoteShadow } from './stickerNoteUtils';

type StickerShapeComponentProps = {
  util: NoteShapeUtil;
  shape: DrNoteShape;
};

export const StickerShapeComponent = ({ util, shape }: StickerShapeComponentProps) => {
  const editor = useEditor();
  const { id, type, props } = shape;
  const { scale, richText, fontSizeAdjustment, textFirstEditedBy } = props;

  const rotation = useValue(
    'shape rotation',
    () => editor.getShapePageTransform(id)?.rotation() ?? 0,
    [editor, id],
  );
  const isSelected = useValue('isSelected', () => editor.getOnlySelectedShapeId() === id, [
    editor,
    id,
  ]);
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === id, [editor, id]);
  const isReadyForEditing = useValue(
    'isReadyForEditing',
    () => {
      const editingShapeId = editor.getEditingShapeId();
      return (
        editingShapeId !== null && (editingShapeId === id || editor.getHoveredShapeId() === id)
      );
    },
    [editor, id],
  );
  const isEmpty = useValue(
    'isEmpty',
    () => renderPlaintextFromRichText(editor, richText).trim() === '',
    [editor, richText],
  );

  const dv = getDisplayValues(util, shape);
  const nw = dv.noteWidth * scale;
  const nh = getStickerNoteHeight(shape, dv.noteHeight);
  const hideShadows = editor.getEfficientZoomLevel() * scale < 0.25;

  const labelStyle =
    scale !== 1
      ? {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: dv.noteWidth,
          height: dv.noteHeight + shape.props.growY,
        }
      : undefined;

  const startEditing = useCallback(() => {
    startLabelEditing(editor, id);
  }, [editor, id]);

  const attribution = useValue(
    'attribution',
    () => {
      if (!textFirstEditedBy || isEmpty) return null;
      const name = editor.getAttributionDisplayName(textFirstEditedBy);
      if (!name) return null;
      return { short: name.split(' ')[0], full: name };
    },
    [textFirstEditedBy, isEmpty, editor],
  );

  const showRichTextLabel = !isEmpty || isReadyForEditing || isEditing;
  const showEmptyCaret = isSelected && isEmpty && !isEditing;

  return (
    <Fragment>
      <div
        id={id}
        className="dr-note__container"
        style={{
          width: nw,
          height: nh,
          backgroundColor: dv.noteBackgroundColor,
          borderBottom: hideShadows
            ? `${dv.borderWidth * scale}px solid ${dv.borderColor}`
            : 'none',
          boxShadow: hideShadows ? 'none' : getStickerNoteShadow(scale, rotation),
        }}
      >
        {attribution && (
          <DrawUiTooltip content={attribution.full} side="bottom">
            <div
              className="dr-note__attribution"
              style={{
                ['--note-attribution-scale' as string]: scale,
                fontSize: 11 * scale,
                color: dv.labelColor,
                opacity: 0.6,
              }}
            >
              {attribution.short}
            </div>
          </DrawUiTooltip>
        )}
        {showEmptyCaret && (
          <EmptyLabelCaret
            fontFamily={dv.labelFontFamily}
            fontSize={(fontSizeAdjustment ?? 1) * dv.labelFontSize}
            lineHeight={dv.labelLineHeight}
            labelColor={dv.labelColor}
            textAlign={dv.labelHorizontalAlign}
            verticalAlign={dv.labelVerticalAlign}
            padding={dv.labelPadding}
            style={labelStyle}
            onActivate={startEditing}
          />
        )}
        {showRichTextLabel && (
          <RichTextLabel
            shapeId={id}
            type={type}
            fontFamily={dv.labelFontFamily}
            fontSize={(fontSizeAdjustment ?? 1) * dv.labelFontSize}
            lineHeight={dv.labelLineHeight}
            textAlign={dv.labelHorizontalAlign}
            verticalAlign={dv.labelVerticalAlign}
            richText={richText}
            isSelected={isSelected}
            labelColor={dv.labelColor}
            wrap
            padding={dv.labelPadding}
            hasCustomTabBehavior
            showTextOutline={false}
            style={labelStyle}
          />
        )}
      </div>
    </Fragment>
  );
};

import { Fragment, useCallback, useLayoutEffect, useRef } from 'react';
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
import {
  fitStickerFontSize,
  getStickerFontSizePx,
  getStickerTextAlign,
  getStickerTextLimits,
  stickerGrowYForContent,
} from './stickerTextStyle';

type StickerShapeComponentProps = {
  util: NoteShapeUtil;
  shape: DrNoteShape;
};

export const StickerShapeComponent = ({ util, shape }: StickerShapeComponentProps) => {
  const editor = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
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
  const textAlign = getStickerTextAlign(shape);
  const nw = dv.noteWidth * scale;
  const nh = getStickerNoteHeight(shape, dv.noteHeight);
  const hideShadows = editor.getEfficientZoomLevel() * scale < 0.25;

  const labelStyle = {
    ...(scale !== 1
      ? {
          transform: `scale(${scale})`,
          transformOrigin: 'top left' as const,
          width: dv.noteWidth,
          height: dv.noteHeight + shape.props.growY,
        }
      : undefined),
    // RichTextLabel принимает только start/center/end; justify кладём поверх через style.
    ...(textAlign === 'justify' ? { textAlign: 'justify' as const } : undefined),
  };
  const richTextAlign = textAlign === 'justify' ? 'start' : textAlign;

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || isEditing) return;

    root.scrollTop = 0;
    root.scrollLeft = 0;

    const selection = root.ownerDocument.getSelection();
    if (!selection || selection.isCollapsed) return;
    const anchor = selection.anchorNode;
    if (anchor && root.contains(anchor)) selection.removeAllRanges();
  }, [isEditing, isSelected]);

  const preferredFontSize = getStickerFontSizePx(editor, shape);

  useLayoutEffect(() => {
    const limits = getStickerTextLimits(dv.noteWidth, dv.noteHeight, dv.labelPadding);
    const renderedPx = Math.round((fontSizeAdjustment ?? 1) * dv.labelFontSize);

    const commit = (px: number, growY: number) => {
      if (px === renderedPx && Math.abs(growY - shape.props.growY) <= 1) return;
      if (dv.labelFontSize <= 0) return;

      editor.run(
        () => {
          editor.updateShape({
            id,
            type: 'note',
            props: {
              growY,
              fontSizeAdjustment: px / dv.labelFontSize,
            },
          });
        },
        { history: 'ignore' },
      );
    };

    if (isEmpty && !isEditing) {
      commit(preferredFontSize, 0);
      return;
    }

    const root = containerRef.current;
    const inner = root?.querySelector('.dr-text-label__inner') as HTMLElement | null;
    const content = root?.querySelector(
      '.dr-text.tl-text-content .dr-rich-text',
    ) as HTMLElement | null;
    if (!inner || !content) return;

    const previousFontSize = inner.style.fontSize;
    const measure = (px: number) => {
      inner.style.fontSize = `${px}px`;
      return content.scrollHeight;
    };

    let fitted: { px: number; contentHeight: number };
    try {
      fitted = fitStickerFontSize({
        preferredPx: preferredFontSize,
        maxContentHeight: limits.maxContentHeight,
        measure,
      });
    } finally {
      inner.style.fontSize = previousFontSize;
    }

    commit(
      fitted.px,
      stickerGrowYForContent(fitted.contentHeight, dv.labelPadding, dv.noteHeight, limits.maxGrowY),
    );
  }, [
    editor,
    id,
    isEditing,
    isEmpty,
    richText,
    fontSizeAdjustment,
    preferredFontSize,
    textAlign,
    dv.labelFontSize,
    dv.labelPadding,
    dv.noteWidth,
    dv.noteHeight,
    shape.props.growY,
  ]);

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
        ref={containerRef}
        id={id}
        className="dr-note__container"
        data-sticker-align={textAlign}
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
            textAlign={textAlign}
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
            textAlign={richTextAlign}
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

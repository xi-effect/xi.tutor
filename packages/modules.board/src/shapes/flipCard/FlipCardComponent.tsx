import { useCallback, useRef } from 'react';
import { RichTextLabel, useEditor, useValue, renderPlaintextFromRichText } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { startLabelEditing } from '../labels/startLabelEditing';
import { EmptyLabelCaret } from '../labels/EmptyLabelCaret';
import { FlipCardShape } from './FlipCardShape';
import {
  BASE_CARD_HEIGHT,
  BASE_CARD_WIDTH,
  LABEL_FONT_SIZE,
  LABEL_LINE_HEIGHT,
  LABEL_PADDING,
} from './consts';

export const FlipCardComponent = ({ shape }: { shape: FlipCardShape }) => {
  const editor = useEditor();
  const { id } = shape;
  const { w, h, richText, backText, isFlipped } = shape.props;

  const scale = Math.min(w / BASE_CARD_WIDTH, h / BASE_CARD_HEIGHT);

  const activeRichText = isFlipped ? backText : richText;

  const isSelected = useValue('isSelected', () => editor.getOnlySelectedShapeId() === id, [
    editor,
    id,
  ]);
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === id, [editor, id]);
  const isEmpty = useValue(
    'isEmpty',
    () => renderPlaintextFromRichText(editor, activeRichText).trim() === '',
    [editor, activeRichText],
  );

  const startEditing = useCallback(() => {
    console.log('[flip-card] startEditing called, canEdit:', editor.canEditShape(shape));
    startLabelEditing(editor, id);
    console.log('[flip-card] after startLabelEditing, editingShapeId:', editor.getEditingShapeId());
  }, [editor, id, shape]);

  const handleFlipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    editor.updateShape<FlipCardShape>({
      id,
      type: 'flip-card',
      props: { isFlipped: !isFlipped },
    });
  };

  const labelStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: BASE_CARD_WIDTH,
    height: BASE_CARD_HEIGHT,
  };

  const showRichTextLabel = !isEmpty || isEditing;
  const showEmptyCaret = isSelected && isEmpty && !isEditing;

  const buttonSize = Math.min(36, Math.max(22, Math.min(w, h) * 0.14));

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const CLICK_THRESHOLD = 4;

  const handleFacePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleFacePointerUp = (e: React.PointerEvent) => {
    const start = pointerDownPos.current;
    pointerDownPos.current = null;
    if (!start || isEditing) return;

    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    if (dx > CLICK_THRESHOLD || dy > CLICK_THRESHOLD) return;

    editor.setSelectedShapes([id]);
    startEditing();
  };

  return (
    <div className="relative select-none" style={{ width: w, height: h, perspective: 1200 }}>
      <div
        className="absolute inset-0 transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="bg-orange-20 ring-orange-40 absolute inset-0 overflow-hidden rounded-xl ring"
          style={{ backfaceVisibility: 'hidden' }}
          onPointerDown={handleFacePointerDown}
          onPointerUp={handleFacePointerUp}
        >
          {!isFlipped && showEmptyCaret && (
            <EmptyLabelCaret
              fontFamily="draw_draw, sans-serif"
              fontSize={LABEL_FONT_SIZE}
              lineHeight={LABEL_LINE_HEIGHT}
              labelColor="black"
              textAlign="center"
              verticalAlign="middle"
              padding={LABEL_PADDING}
              style={labelStyle}
              onActivate={startEditing}
            />
          )}
          {!isFlipped && showRichTextLabel && (
            <RichTextLabel
              shapeId={id}
              type="flip-card"
              fontFamily="draw_draw, sans-serif"
              fontSize={LABEL_FONT_SIZE}
              lineHeight={LABEL_LINE_HEIGHT}
              textAlign="center"
              verticalAlign="middle"
              richText={richText}
              isSelected={isSelected}
              labelColor="black"
              wrap
              padding={LABEL_PADDING}
              hasCustomTabBehavior
              showTextOutline={false}
              style={labelStyle}
            />
          )}
        </div>

        <div
          className="bg-gray-0 ring-orange-20 absolute inset-0 overflow-hidden rounded-xl ring-2"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onPointerDown={handleFacePointerDown}
          onPointerUp={handleFacePointerUp}
        >
          {isFlipped && showEmptyCaret && (
            <EmptyLabelCaret
              fontFamily="draw_draw, sans-serif"
              fontSize={LABEL_FONT_SIZE}
              lineHeight={LABEL_LINE_HEIGHT}
              labelColor="black"
              textAlign="center"
              verticalAlign="middle"
              padding={LABEL_PADDING}
              style={labelStyle}
              onActivate={startEditing}
            />
          )}
          {isFlipped && showRichTextLabel && (
            <RichTextLabel
              shapeId={id}
              type="flip-card"
              fontFamily="draw_draw, sans-serif"
              fontSize={LABEL_FONT_SIZE}
              lineHeight={LABEL_LINE_HEIGHT}
              textAlign="center"
              verticalAlign="middle"
              richText={backText}
              isSelected={isSelected}
              labelColor="black"
              wrap
              padding={LABEL_PADDING}
              hasCustomTabBehavior
              showTextOutline={false}
              style={labelStyle}
            />
          )}
        </div>
      </div>

      {!isEditing && (
        <div
          className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            size="s"
            variant="ghost"
            onClick={handleFlipClick}
            className="pointer-events-auto"
            style={{ height: buttonSize, fontSize: buttonSize * 0.4 }}
          >
            Перевернуть
          </Button>
        </div>
      )}
    </div>
  );
};

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { RichTextLabel, useEditor, useValue, renderPlaintextFromRichText } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { startLabelEditing } from '../labels/startLabelEditing';
import { EmptyLabelCaret } from '../labels/EmptyLabelCaret';
import { FlipCardShape } from './FlipCardShape';
import { useResolvedAssetSrc } from './useResolvedAssetSrc';
import {
  BASE_CARD_HEIGHT,
  BASE_CARD_WIDTH,
  LABEL_FONT_SIZE,
  LABEL_LINE_HEIGHT,
  LABEL_PADDING,
} from './consts';
import { useYjsContext } from '../../providers/YjsContext';

const CLICK_THRESHOLD = 4;
const MIN_TEXT_FIT_SCALE = 0.4;
const IMAGE_AREA_RATIO = 0.45;

export const FlipCardComponent = ({ shape }: { shape: FlipCardShape }) => {
  const editor = useEditor();
  const { id } = shape;
  const { w, h, richText, isFlipped, frontImageAssetId, backImageAssetId } = shape.props;

  const { token } = useYjsContext();

  const activeImageAssetId = isFlipped ? backImageAssetId : frontImageAssetId;
  const resolvedImageSrc = useResolvedAssetSrc(editor, activeImageAssetId, token);

  const hasImage = !!activeImageAssetId;
  const imageAreaHeight = hasImage ? h * IMAGE_AREA_RATIO : 0;

  const scale = Math.min(w / BASE_CARD_WIDTH, h / BASE_CARD_HEIGHT);

  const isSelected = useValue('isSelected', () => editor.getOnlySelectedShapeId() === id, [
    editor,
    id,
  ]);
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === id, [editor, id]);
  const isEmpty = useValue(
    'isEmpty',
    () => renderPlaintextFromRichText(editor, richText).trim() === '',
    [editor, richText],
  );

  const startEditing = useCallback(() => {
    startLabelEditing(editor, id);
  }, [editor, id]);

  const handleFlipClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const current = editor.getShape<FlipCardShape>(id);
    if (!current) return;

    const {
      richText: liveText,
      frontRichText,
      backRichText,
      isFlipped: currentlyFlipped,
    } = current.props;

    if (!currentlyFlipped) {
      editor.updateShape<FlipCardShape>({
        id,
        type: 'flip-card',
        props: { frontRichText: liveText, richText: backRichText, isFlipped: true },
      });
    } else {
      editor.updateShape<FlipCardShape>({
        id,
        type: 'flip-card',
        props: { backRichText: liveText, richText: frontRichText, isFlipped: false },
      });
    }
  };

  const measureRef = useRef<HTMLDivElement>(null);
  const [textFitScale, setTextFitScale] = useState(1);

  const buttonSize = Math.min(36, Math.max(22, Math.min(w, h) * 0.14));
  const BUTTON_ZONE = buttonSize + 16;
  const availableTextHeight = Math.max(0, h - imageAreaHeight - BUTTON_ZONE - LABEL_PADDING * 2);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const recalc = () => {
      const naturalHeight = el.scrollHeight;
      console.log('[flip-card fit]', {
        naturalHeight,
        scale,
        availableTextHeight,
        computed:
          naturalHeight === 0
            ? 'SKIPPED (naturalHeight=0)'
            : availableTextHeight / (naturalHeight * scale),
      });
      if (naturalHeight === 0 || scale === 0) return;

      const nextFit = Math.min(1, availableTextHeight / (naturalHeight * scale));
      setTextFitScale(Math.max(MIN_TEXT_FIT_SCALE, nextFit));
    };

    recalc();

    const ro = new ResizeObserver(() => recalc());
    ro.observe(el);
    return () => ro.disconnect();
  }, [richText, scale, availableTextHeight]);

  const finalTextScale = scale * textFitScale;

  const labelStyle = {
    transform: `scale(${finalTextScale})`,
    transformOrigin: 'top left',
    width: BASE_CARD_WIDTH,
    height: BASE_CARD_HEIGHT,
  };

  const showRichTextLabel = !isEmpty || isEditing;
  const showEmptyCaret = isEmpty && isEditing;

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

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
    requestAnimationFrame(() => startEditing());
  };

  const renderFace = (activeSide: 'front' | 'back') => {
    const isFront = activeSide === 'front';
    const bgClass = isFront
      ? 'bg-orange-20 ring-orange-40 ring'
      : 'bg-gray-0 ring-orange-20 ring-2';

    return (
      <div
        className={`${bgClass} absolute inset-0 flex flex-col overflow-hidden rounded-xl`}
        style={{
          backfaceVisibility: 'hidden',
          transform: isFront ? undefined : 'rotateY(180deg)',
          pointerEvents: isFlipped === isFront ? 'none' : 'auto',
        }}
        onPointerDown={handleFacePointerDown}
        onPointerUp={handleFacePointerUp}
      >
        {hasImage && (
          <div className="w-full shrink-0 overflow-hidden" style={{ height: imageAreaHeight }}>
            {resolvedImageSrc && (
              <img
                src={resolvedImageSrc}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            )}
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          {showEmptyCaret && (
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
          {showRichTextLabel && (
            <div ref={measureRef}>
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
            </div>
          )}
        </div>
      </div>
    );
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
        {renderFace('front')}
        {renderFace('back')}
      </div>

      {!isEditing && (
        <div
          className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            size="s"
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

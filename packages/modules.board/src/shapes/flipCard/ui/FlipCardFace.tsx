import type { RefObject } from 'react';
import { DrShapeId, RichTextLabel, type DrRichText } from '@ibodr/draw';
import { EmptyLabelCaret } from '../../labels/EmptyLabelCaret';
import { FlipCardGhostMeasurer } from './FlipCardGhostMeasurer';
import { LABEL_FONT_SIZE, LABEL_LINE_HEIGHT, LABEL_PADDING } from '../consts';

type FlipCardFaceProps = {
  shapeId: DrShapeId;
  side: 'front' | 'back';
  isFlipped: boolean;
  cardWidth: number;
  cardHeight: number;
  cardScale: number;
  hasImage: boolean;
  resolvedImageSrc: string | null;
  imageAreaHeight: number;
  textAreaHeight: number;
  displayRichText: DrRichText;
  plainText: string;
  fitFontSize: number;
  ghostRef: RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  isEditing: boolean;
  onStartEditing: () => void;
  onFacePointerDown: (e: React.PointerEvent) => void;
  onFacePointerUp: (e: React.PointerEvent) => void;
};

export const FlipCardFace = ({
  shapeId,
  side,
  isFlipped,
  cardWidth,
  cardScale,
  hasImage,
  resolvedImageSrc,
  imageAreaHeight,
  textAreaHeight,
  displayRichText,
  plainText,
  fitFontSize,
  ghostRef,
  isSelected,
  isEditing,
  onStartEditing,
  onFacePointerDown,
  onFacePointerUp,
}: FlipCardFaceProps) => {
  const isFront = side === 'front';
  const isThisFaceActive = isFront === !isFlipped;
  const isEmpty = plainText.trim() === '';
  const bgClass = isFront ? 'bg-orange-20 ring-orange-40 ring' : 'bg-gray-0 ring-orange-20 ring-2';
  const labelStyle = { width: cardWidth, height: textAreaHeight };

  const canUseRichTextLabel = isThisFaceActive || !isEditing;
  const showRichTextLabel = !isEmpty && canUseRichTextLabel;
  const showPlainFallback = !isEmpty && !canUseRichTextLabel;
  const showEmptyCaret = isEmpty && isEditing && isThisFaceActive;

  return (
    <div
      className="absolute inset-0"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isFront ? undefined : 'rotateY(180deg)',
        pointerEvents: isFlipped === isFront ? 'none' : 'auto',
      }}
      onPointerDown={onFacePointerDown}
      onPointerUp={onFacePointerUp}
    >
      <div className={`${bgClass} flex h-full w-full flex-col overflow-hidden rounded-xl`}>
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

        <div
          className="relative flex w-full shrink-0 items-center justify-center overflow-hidden"
          style={{ height: textAreaHeight }}
        >
          {showEmptyCaret && (
            <EmptyLabelCaret
              fontFamily="draw_draw, sans-serif"
              fontSize={LABEL_FONT_SIZE * cardScale}
              lineHeight={LABEL_LINE_HEIGHT}
              labelColor="black"
              textAlign="center"
              verticalAlign="middle"
              padding={LABEL_PADDING}
              style={labelStyle}
              onActivate={onStartEditing}
            />
          )}

          {(showRichTextLabel || (isEditing && isThisFaceActive)) && (
            <RichTextLabel
              shapeId={shapeId}
              type="flip-card"
              fontFamily="draw_draw, sans-serif"
              fontSize={fitFontSize}
              lineHeight={LABEL_LINE_HEIGHT}
              textAlign="center"
              verticalAlign="middle"
              richText={displayRichText}
              isSelected={isSelected}
              labelColor="black"
              wrap
              padding={LABEL_PADDING}
              hasCustomTabBehavior
              showTextOutline={false}
              style={labelStyle}
            />
          )}

          {showPlainFallback && (
            <div
              className="overflow-hidden"
              style={{
                width: cardWidth,
                height: textAreaHeight,
                fontSize: fitFontSize,
                lineHeight: LABEL_LINE_HEIGHT,
                padding: LABEL_PADDING,
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                fontFamily: 'draw_draw, sans-serif',
                color: 'black',
                boxSizing: 'border-box',
              }}
            >
              {plainText}
            </div>
          )}
        </div>
      </div>

      <FlipCardGhostMeasurer ghostRef={ghostRef} />
    </div>
  );
};

import { useCallback } from 'react';
import { getColorValue, useEditor, useValue } from '@ibodr/draw';
import { startLabelEditing } from '../labels/startLabelEditing';
import type { FlipCardShape } from './FlipCardShape';
import {
  useResolvedAssetSrc,
  useFaceFitFontSize,
  useFlipCardFlip,
  useFaceClickToEdit,
} from './hooks';
import { FlipCardFace, FlipCardFlipButton } from './ui';
import { computeImageAreaHeight } from './utils/computeImageAreaHeight';
import { useYjsContext } from '../../providers/YjsContext';
import {
  BASE_CARD_WIDTH,
  BASE_CARD_HEIGHT,
  LABEL_PADDING,
  ROTATION_DURATION_MS,
  FLIP_BUTTON_MIN_SIZE_PX,
  FLIP_BUTTON_MAX_SIZE_PX,
  FLIP_BUTTON_SIZE_RATIO,
  FLIP_BUTTON_ZONE_GAP_PX,
} from './consts';

export const FlipCardComponent = ({ shape }: { shape: FlipCardShape }) => {
  const editor = useEditor();
  const { id } = shape;
  const {
    w,
    h,
    richText,
    frontRichText,
    backRichText,
    isFlipped,
    frontImageAssetId,
    backImageAssetId,
    frontColor,
    backColor,
  } = shape.props;

  const { token } = useYjsContext();

  const theme = useValue('theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor]);
  const colors = theme.colors[colorMode];

  const frontBackgroundColor = getColorValue(colors, frontColor, 'solid');
  const backBackgroundColor = getColorValue(colors, backColor, 'solid');

  const frontResolvedSrc = useResolvedAssetSrc(editor, frontImageAssetId, token);
  const backResolvedSrc = useResolvedAssetSrc(editor, backImageAssetId, token);

  const frontAssetRecord = useValue(
    'frontAssetRecord',
    () => (frontImageAssetId ? editor.getAsset(frontImageAssetId) : null),
    [editor, frontImageAssetId],
  );
  const backAssetRecord = useValue(
    'backAssetRecord',
    () => (backImageAssetId ? editor.getAsset(backImageAssetId) : null),
    [editor, backImageAssetId],
  );

  const hasFrontImage = !!frontImageAssetId;
  const hasBackImage = !!backImageAssetId;

  const cardScale = Math.min(w / BASE_CARD_WIDTH, h / BASE_CARD_HEIGHT);

  const isSelected = useValue('isSelected', () => editor.getOnlySelectedShapeId() === id, [
    editor,
    id,
  ]);
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === id, [editor, id]);

  const frontDisplayRichText = !isFlipped ? richText : frontRichText;
  const backDisplayRichText = isFlipped ? richText : backRichText;

  const startEditing = useCallback(() => startLabelEditing(editor, id), [editor, id]);
  const handleFlipClick = useFlipCardFlip(id);
  const { handleFacePointerDown, handleFacePointerUp } = useFaceClickToEdit(
    id,
    isEditing,
    startEditing,
  );

  const buttonSize = Math.min(
    FLIP_BUTTON_MAX_SIZE_PX,
    Math.max(FLIP_BUTTON_MIN_SIZE_PX, Math.min(w, h) * FLIP_BUTTON_SIZE_RATIO),
  );
  const buttonZoneHeight = buttonSize + FLIP_BUTTON_ZONE_GAP_PX;
  const contentWidth = Math.max(0, w - LABEL_PADDING * 2);

  const frontImageAreaHeight = hasFrontImage ? computeImageAreaHeight(w, h, frontAssetRecord) : 0;
  const frontTextAreaHeight = Math.max(0, h - frontImageAreaHeight - buttonZoneHeight);
  const frontAvailableTextHeight = Math.max(0, frontTextAreaHeight - LABEL_PADDING * 2);

  const backImageAreaHeight = hasBackImage ? computeImageAreaHeight(w, h, backAssetRecord) : 0;
  const backTextAreaHeight = Math.max(0, h - backImageAreaHeight - buttonZoneHeight);
  const backAvailableTextHeight = Math.max(0, backTextAreaHeight - LABEL_PADDING * 2);

  const front = useFaceFitFontSize(
    editor,
    frontDisplayRichText,
    cardScale,
    frontAvailableTextHeight,
    contentWidth,
  );
  const back = useFaceFitFontSize(
    editor,
    backDisplayRichText,
    cardScale,
    backAvailableTextHeight,
    contentWidth,
  );

  return (
    <div className="relative select-none" style={{ width: w, height: h, perspective: 1200 }}>
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: `transform ${ROTATION_DURATION_MS}ms ease-in-out`,
          willChange: 'transform',
        }}
      >
        <FlipCardFace
          shapeId={id}
          side="front"
          isFlipped={isFlipped}
          cardWidth={w}
          cardHeight={h}
          cardScale={cardScale}
          hasImage={hasFrontImage}
          resolvedImageSrc={frontResolvedSrc}
          imageAreaHeight={frontImageAreaHeight}
          textAreaHeight={frontTextAreaHeight}
          displayRichText={frontDisplayRichText}
          plainText={front.plainText}
          fitFontSize={front.fitFontSize}
          ghostRef={front.ghostRef}
          isSelected={isSelected}
          isEditing={isEditing}
          onStartEditing={startEditing}
          onFacePointerDown={handleFacePointerDown}
          onFacePointerUp={handleFacePointerUp}
          backgroundColor={frontBackgroundColor}
        />
        <FlipCardFace
          shapeId={id}
          side="back"
          isFlipped={isFlipped}
          cardWidth={w}
          cardHeight={h}
          cardScale={cardScale}
          hasImage={hasBackImage}
          resolvedImageSrc={backResolvedSrc}
          imageAreaHeight={backImageAreaHeight}
          textAreaHeight={backTextAreaHeight}
          displayRichText={backDisplayRichText}
          plainText={back.plainText}
          fitFontSize={back.fitFontSize}
          ghostRef={back.ghostRef}
          isSelected={isSelected}
          isEditing={isEditing}
          onStartEditing={startEditing}
          onFacePointerDown={handleFacePointerDown}
          onFacePointerUp={handleFacePointerUp}
          backgroundColor={backBackgroundColor}
        />
      </div>

      {!isEditing && <FlipCardFlipButton size={buttonSize} onClick={handleFlipClick} />}
    </div>
  );
};

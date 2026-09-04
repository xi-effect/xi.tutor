import { useCallback, useRef, useState } from 'react';
import { track, useEditor, type DrAssetId } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { Image as ImageIcon } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { insertFlipCardImage } from '../utils/insertFlipCardImage';
import { useYjsContext } from '../../../providers/YjsContext';
import type { FlipCardShape } from '../FlipCardShape';

export const FlipCardImageButton = track(function FlipCardImageButton() {
  const { t } = useTranslation('board');

  const editor = useEditor();
  const { token } = useYjsContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedShapes = editor.getSelectedShapes();
  const shape =
    selectedShapes.length === 1 && selectedShapes[0].type === 'flip-card'
      ? (selectedShapes[0] as FlipCardShape)
      : null;

  const handleClick = useCallback(
    (e: React.PointerEvent) => {
      editor.markEventAsHandled(e);
      e.stopPropagation();
      fileInputRef.current?.click();
    },
    [editor],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !shape) return;

      const shapeId = shape.id;
      const propKey = shape.props.isFlipped ? 'backImageAssetId' : 'frontImageAssetId';

      setIsUploading(true);
      try {
        await insertFlipCardImage(editor, file, token, (assetId: DrAssetId) => {
          const current = editor.getShape<FlipCardShape>(shapeId);
          if (!current) return;

          const prevAssetId = current.props[propKey];

          editor.updateShape<FlipCardShape>({
            id: shapeId,
            type: 'flip-card',
            props: { [propKey]: assetId },
          });

          if (prevAssetId && prevAssetId !== assetId) {
            editor.deleteAssets([prevAssetId]);
          }
        });
      } finally {
        setIsUploading(false);
      }
    },
    [editor, shape, token],
  );

  if (!shape) return null;

  return (
    <>
      <Button
        variant="none"
        size="s"
        className="hover:bg-status-info-background p-1"
        onPointerDown={handleClick}
        disabled={isUploading}
        title={t('toolbar.flipCardAddImage')}
      >
        <ImageIcon />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
});

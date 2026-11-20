import { useEffect, useState } from 'react';
import { Editor, DrAssetId, useValue } from '@ibodr/draw';
import { myAssetStore } from '../../../features/imageStore';
import { isDisplayableAssetUrl } from '../../../utils/storedFileSrc';
import { zoomStepCeil } from '../../../utils/rasterBudget';
import { useRetainedBlobUrl } from '../../../utils/useRetainedBlobUrl';

export function useResolvedAssetSrc(
  editor: Editor,
  assetId: DrAssetId | null,
  token: string,
  displayCssWidth: number,
) {
  const zoom = useValue('resolved-asset-zoom', () => editor.getZoomLevel(), [editor]);
  const zoomStep = zoomStepCeil(zoom);
  const storedSrc = useValue(
    'flip-card-asset-src',
    () => {
      if (!assetId) return '';
      const asset = editor.getAsset(assetId);
      return typeof asset?.props.src === 'string' ? asset.props.src : '';
    },
    [editor, assetId],
  );
  const assetSize = useValue(
    'flip-card-asset-size',
    () => {
      if (!assetId) return 0;
      const asset = editor.getAsset(assetId);
      return asset?.type === 'image' ? asset.props.w : 0;
    },
    [editor, assetId],
  );
  const [src, setSrc] = useState<string | null>(null);
  useRetainedBlobUrl(src);

  useEffect(() => {
    if (!assetId) {
      setSrc(null);
      return;
    }

    const preview = editor.getTemporaryAssetPreview(assetId) ?? null;

    if (!storedSrc) {
      setSrc(preview);
      return;
    }

    if (isDisplayableAssetUrl(storedSrc)) {
      setSrc(storedSrc);
      return;
    }

    const asset = editor.getAsset(assetId);
    if (!asset) {
      setSrc(preview);
      return;
    }

    let cancelled = false;
    const screenScale =
      assetSize > 0 && displayCssWidth > 0 ? zoomStep * (displayCssWidth / assetSize) : 1;

    Promise.resolve(
      myAssetStore(token).resolve?.(asset, {
        screenScale,
        steppedScreenScale: zoomStepCeil(screenScale),
        dpr: window.devicePixelRatio || 1,
        networkEffectiveType: null,
        shouldResolveToOriginal: false,
      }),
    ).then((resolved) => {
      if (!cancelled) setSrc(resolved ?? storedSrc);
    });

    return () => {
      cancelled = true;
    };
  }, [editor, assetId, token, storedSrc, assetSize, displayCssWidth, zoomStep]);

  return src;
}

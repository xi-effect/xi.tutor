import { useEffect, useState } from 'react';
import { Editor, DrAssetId, useValue } from '@ibodr/draw';
import { myAssetStore } from '../../../features/imageStore';
import { isDisplayableAssetUrl } from '../../../utils/storedFileSrc';

export function useResolvedAssetSrc(editor: Editor, assetId: DrAssetId | null, token: string) {
  const storedSrc = useValue(
    'flip-card-asset-src',
    () => {
      if (!assetId) return '';
      const asset = editor.getAsset(assetId);
      return typeof asset?.props.src === 'string' ? asset.props.src : '';
    },
    [editor, assetId],
  );
  const [src, setSrc] = useState<string | null>(null);

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

    Promise.resolve(
      myAssetStore(token).resolve?.(asset, {
        screenScale: 1,
        steppedScreenScale: 1,
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
  }, [editor, assetId, token, storedSrc]);

  return src;
}

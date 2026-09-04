import { useEffect, useState } from 'react';
import { Editor, DrAssetId } from '@ibodr/draw';
import { myAssetStore } from '../../../features/imageStore';

export function useResolvedAssetSrc(editor: Editor, assetId: DrAssetId | null, token: string) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setSrc(null);
      return;
    }

    const asset = editor.getAsset(assetId);
    if (!asset) {
      setSrc(null);
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
      if (!cancelled) setSrc(resolved ?? asset.props.src ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [editor, assetId, token]);

  return src;
}

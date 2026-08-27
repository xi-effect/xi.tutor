import type { DrImageShape, Editor } from '@ibodr/draw';
import { getBoardStorageToken } from '../utils/shapeSvgExport';
import { isDisplayableAssetUrl } from '../utils/storedFileSrc';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { OcrImageLoadError } from './types';

async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new OcrImageLoadError(`Failed to fetch image: ${response.status}`);
  }
  return response.blob();
}

/**
 * Пиксели изображения для OCR. Идём через уже резолвнутый blob/data URL
 * (storage token), без отправки картинки на отдельный OCR backend.
 */
export async function getImageBlobFromShape(editor: Editor, shape: DrImageShape): Promise<Blob> {
  const assetId = shape.props.assetId;
  if (!assetId) throw new OcrImageLoadError('Image has no asset');

  const asset = editor.getAsset(assetId);
  const src = asset && 'src' in asset.props ? String(asset.props.src ?? '') : '';
  if (!src) throw new OcrImageLoadError('Image asset has no src');

  try {
    if (isDisplayableAssetUrl(src)) {
      return await urlToBlob(src);
    }

    const token = getBoardStorageToken();
    const resolved = await resolveAssetUrl(src, token, { ignoreNegativeCache: true });
    if (!resolved || !isDisplayableAssetUrl(resolved)) {
      throw new OcrImageLoadError('Could not resolve image URL');
    }
    return await urlToBlob(resolved);
  } catch (error) {
    if (error instanceof OcrImageLoadError) throw error;
    throw new OcrImageLoadError(
      error instanceof Error ? error.message : 'Could not read image pixels',
    );
  }
}

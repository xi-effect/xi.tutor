import type { DrAsset } from '@ibodr/draw';
import { DEFAULT_IMAGE_AREA_RATIO, MIN_IMAGE_AREA_RATIO, MAX_IMAGE_AREA_RATIO } from '../consts';

export const computeImageAreaHeight = (
  cardWidth: number,
  cardHeight: number,
  asset: DrAsset | null | undefined,
): number => {
  const assetW = asset?.type === 'image' ? asset.props.w : undefined;
  const assetH = asset?.type === 'image' ? asset.props.h : undefined;

  if (!assetW || !assetH) return cardHeight * DEFAULT_IMAGE_AREA_RATIO;

  const naturalHeightForFullWidth = cardWidth * (assetH / assetW);
  const minHeight = cardHeight * MIN_IMAGE_AREA_RATIO;
  const maxHeight = cardHeight * MAX_IMAGE_AREA_RATIO;

  return Math.min(maxHeight, Math.max(minHeight, naturalHeightForFullWidth));
};

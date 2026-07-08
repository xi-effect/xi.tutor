import { defaultShapeUtils, DrAnyShapeUtilConstructor } from '@ibodr/draw';
import { PdfShapeUtil } from './pdf';
import { AudioShapeUtil } from './audio';
import { FrameShapeUtil } from './frame';
import { XiGeoShapeUtil } from './geo';
import { CustomImageShapeUtil } from './image';
import { StickerShapeUtil } from './sticker';
import { EmojiShapeUtil } from './emoji';
import { FileShapeUtil } from './file';
import { CoordinateAxesShapeUtil } from './coordinate-axes';
import { EmojiStickerShapeUtil } from './emojiSticker';

/** Кастомные shape utils — для `<Draw shapeUtils={...}>` (Draw сам мержит с defaultShapeUtils). */
export const boardCustomShapeUtils: DrAnyShapeUtilConstructor[] = [
  PdfShapeUtil,
  AudioShapeUtil,
  FrameShapeUtil,
  XiGeoShapeUtil,
  CustomImageShapeUtil,
  StickerShapeUtil,
  EmojiShapeUtil,
  EmojiStickerShapeUtil,
  FileShapeUtil,
  CoordinateAxesShapeUtil,
];

function mergeShapeUtilsByType(
  defaults: readonly DrAnyShapeUtilConstructor[],
  overrides: readonly DrAnyShapeUtilConstructor[],
): DrAnyShapeUtilConstructor[] {
  const byType = new Map(defaults.map((util) => [util.type, util]));
  for (const util of overrides) {
    byType.set(util.type, util);
  }
  return Array.from(byType.values());
}

/** Полный список для createDrStore — default + кастомные, без дублей по type. */
export const boardStoreShapeUtils = mergeShapeUtilsByType(defaultShapeUtils, boardCustomShapeUtils);

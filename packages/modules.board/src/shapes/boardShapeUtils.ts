import { defaultShapeUtils, DrAnyShapeUtilConstructor } from '@ibodr/draw';
import { PdfShapeUtil } from './pdf';
import { AudioShapeUtil } from './audio';
import { FrameShapeUtil } from './frame';
import { XiGeoShapeUtil } from './geo';
import { XiPolygonShapeUtil } from './polygon/XiPolygonShapeUtil';
import { CustomImageShapeUtil } from './image';
import { StickerShapeUtil } from './sticker';
import { EmojiShapeUtil } from './emoji';
import { FileShapeUtil } from './file';
import { CoordinateAxesShapeUtil } from './coordinate-axes';
import { MathFigureShapeUtil } from './math-figure';
import { EmojiStickerShapeUtil } from './emojiSticker';
import { TextShapeUtil } from './text';
import { ArrowShapeUtil } from './arrow';
import { PresentationShapeUtil } from './presentation';
import { FlipCardShapeUtil } from './flipCard';
import { DiceShapeUtil } from './dice';
import { ActivityShapeUtil } from '../activities';
import { boardEmbedDefinitions } from './embed/embeddefinitions';
import { BoardEmbedShapeUtil } from './embed/BoardEmbedShapeUtil';
import { DrawShapeUtil, HighlightShapeUtil, LineShapeUtil } from './lodShapeUtils';
import './lineStyles/extendedLineStyles';

/** Кастомные shape utils — для `<Draw shapeUtils={...}>` (Draw сам мержит с defaultShapeUtils). */
export const boardCustomShapeUtils: DrAnyShapeUtilConstructor[] = [
  PdfShapeUtil,
  PresentationShapeUtil,
  AudioShapeUtil,
  FrameShapeUtil,
  XiGeoShapeUtil,
  XiPolygonShapeUtil,
  CustomImageShapeUtil,
  StickerShapeUtil,
  EmojiShapeUtil,
  EmojiStickerShapeUtil,
  FileShapeUtil,
  CoordinateAxesShapeUtil,
  FlipCardShapeUtil,
  DiceShapeUtil,
  MathFigureShapeUtil,
  TextShapeUtil,
  ArrowShapeUtil,
  ActivityShapeUtil,
  BoardEmbedShapeUtil.configure({ embedDefinitions: boardEmbedDefinitions }),
  DrawShapeUtil,
  HighlightShapeUtil,
  LineShapeUtil,
];

function mergeShapeUtilsByType(
  defaults: readonly DrAnyShapeUtilConstructor[],
  overrides: readonly DrAnyShapeUtilConstructor[],
): DrAnyShapeUtilConstructor[] {
  const byType = new Map(defaults.map((util) => [util.type, util]));
  for (const util of overrides) {
    if (!util?.type) continue;
    byType.set(util.type, util);
  }
  return Array.from(byType.values());
}

/** Полный список для createDrStore — default + кастомные, без дублей по type. */
export const boardStoreShapeUtils = mergeShapeUtilsByType(defaultShapeUtils, boardCustomShapeUtils);

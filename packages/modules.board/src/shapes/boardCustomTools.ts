import { CoordinateAxesTool } from './coordinate-axes';
import { EmojiTool } from './emoji';
import { EmojiStickerTool } from './emojiSticker';
import { FlipCardTool } from './flipCard';
import { XiGeoTool } from './geo/XiGeoTool';
import { MathFigureTool } from './math-figure';
import { FreeTrapezoidTool, FreeTriangleTool } from './polygon/PolygonTool';

export const boardCustomTools = [
  XiGeoTool,
  FreeTriangleTool,
  FreeTrapezoidTool,
  EmojiTool,
  CoordinateAxesTool,
  MathFigureTool,
  EmojiStickerTool,
  FlipCardTool,
];

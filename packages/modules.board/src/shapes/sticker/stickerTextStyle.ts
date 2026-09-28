import { getDisplayValues, type DrNoteShape, type Editor, type NoteShapeUtil } from '@ibodr/draw';

type StickerDisplay = {
  labelFontSize: number;
  labelLineHeight: number;
  labelFontFamily: string;
  labelFontWeight: string;
  labelFontStyle: string;
  labelPadding: number;
  noteWidth: number;
  noteHeight: number;
};

/** У note нет значения justify в стиле align — храним его в meta. */
const JUSTIFY_META_KEY = 'stickerTextAlign';

export const STICKER_ALIGNS = ['start', 'middle', 'end', 'justify'] as const;
export type StickerAlign = (typeof STICKER_ALIGNS)[number];

export const STICKER_FONT_SIZE_MIN = 12;
export const STICKER_FONT_SIZE_MAX = 48;
/** Выше этого стикер не растёт: дальше уменьшается только отрисовка. */
export const STICKER_MAX_HEIGHT_RATIO = 2;
/** Ступени как в выпадающем списке размера Word и Google Docs, в диапазоне 12–48. */
export const STICKER_FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48] as const;

const FONT_SIZE_META_KEY = 'stickerFontSize';

export function getStickerAlign(shape: DrNoteShape): StickerAlign {
  if (shape.meta?.[JUSTIFY_META_KEY] === 'justify') return 'justify';
  const align = shape.props.align;
  if (align === 'start' || align === 'start-legacy') return 'start';
  if (align === 'end' || align === 'end-legacy') return 'end';
  return 'middle';
}

export function getStickerTextAlign(shape: DrNoteShape): 'start' | 'center' | 'end' | 'justify' {
  const align = getStickerAlign(shape);
  if (align === 'middle') return 'center';
  return align;
}

export function getCommonValue<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  const first = values[0];
  return values.every((value) => value === first) ? first : null;
}

function selectedNotes(editor: Editor): DrNoteShape[] {
  return editor.getSelectedShapes().filter((shape): shape is DrNoteShape => shape.type === 'note');
}

export function applyStickerAlign(editor: Editor, align: StickerAlign) {
  const notes = selectedNotes(editor);
  if (!notes.length) return;

  editor.updateShapes(
    notes.map((shape) => ({
      id: shape.id,
      type: 'note' as const,
      props: { align: align === 'justify' ? ('start' as const) : align },
      meta: { [JUSTIFY_META_KEY]: align === 'justify' ? 'justify' : null },
    })),
  );
}

export function clampStickerFontSize(value: number): number {
  return Math.min(STICKER_FONT_SIZE_MAX, Math.max(STICKER_FONT_SIZE_MIN, Math.round(value)));
}

export function readStickerFontSize(shape: DrNoteShape): number | null {
  const value = shape.meta?.[FONT_SIZE_META_KEY];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return clampStickerFontSize(value);
}

/** Размер из меню: выбранный максимум, а не ужатый для влезания. */
export function getStickerFontSizePx(editor: Editor, shape: DrNoteShape): number {
  const custom = readStickerFontSize(shape);
  if (custom != null) return custom;

  const dv = stickerDisplay(editor, shape);
  return clampStickerFontSize(dv.labelFontSize);
}

export function getStickerTextLimits(noteWidth: number, noteHeight: number, padding: number) {
  const maxBox = Math.max(noteHeight, noteWidth * STICKER_MAX_HEIGHT_RATIO);
  return {
    maxContentHeight: Math.max(0, maxBox - padding * 2),
    maxGrowY: Math.max(0, maxBox - noteHeight),
  };
}

/**
 * Наибольший кегль не выше preferred, при котором текст не выше maxContentHeight.
 * Если не влезает даже минимум, остаётся минимум — лишнее обрежет стикер.
 */
export function fitStickerFontSize(options: {
  preferredPx: number;
  maxContentHeight: number;
  measure: (px: number) => number;
}): { px: number; contentHeight: number } {
  const preferred = clampStickerFontSize(options.preferredPx);
  const preferredHeight = options.measure(preferred);
  if (preferredHeight <= options.maxContentHeight) {
    return { px: preferred, contentHeight: preferredHeight };
  }

  let low = STICKER_FONT_SIZE_MIN;
  let high = preferred - 1;
  let bestPx = STICKER_FONT_SIZE_MIN;
  let bestHeight = options.measure(STICKER_FONT_SIZE_MIN);

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const height = options.measure(mid);
    if (height <= options.maxContentHeight) {
      bestPx = mid;
      bestHeight = height;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return { px: bestPx, contentHeight: bestHeight };
}

export function stickerGrowYForContent(
  contentHeight: number,
  padding: number,
  noteHeight: number,
  maxGrowY: number,
): number {
  const needed = Math.max(0, Math.ceil(contentHeight + padding * 2 - noteHeight));
  return Math.min(maxGrowY, needed);
}

export function applyStickerFontSize(editor: Editor, px: number) {
  const notes = selectedNotes(editor);
  if (!notes.length) return;

  const size = clampStickerFontSize(px);
  editor.updateShapes(
    notes.map((shape) => ({
      id: shape.id,
      type: 'note' as const,
      meta: { [FONT_SIZE_META_KEY]: size },
    })),
  );
}

/**
 * Не даёт отрисовке превысить размер из меню.
 * Ужимание и возврат к этому размеру считает макет стикера.
 */
export function applyStickerFontMetrics(
  editor: Editor,
  shape: DrNoteShape,
): DrNoteShape | undefined {
  const dv = stickerDisplay(editor, shape);
  if (dv.labelFontSize <= 0) return undefined;

  const maxAdjustment = getStickerFontSizePx(editor, shape) / dv.labelFontSize;
  if ((shape.props.fontSizeAdjustment ?? 1) <= maxAdjustment + 0.0001) return undefined;

  return {
    ...shape,
    props: {
      ...shape.props,
      fontSizeAdjustment: maxAdjustment,
    },
  };
}

function stickerDisplay(editor: Editor, shape: DrNoteShape): StickerDisplay {
  return getDisplayValues(editor.getShapeUtil(shape) as NoteShapeUtil, shape);
}

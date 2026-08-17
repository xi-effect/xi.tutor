import { DrRichText } from '@ibodr/schema';

export const BASE_CARD_WIDTH = 160;
export const BASE_CARD_HEIGHT = 260;
export const FLIP_CARD_MIN_SIZE = 120;

export const EMPTY_RICH_TEXT: DrRichText = { type: 'doc', content: [] };

// Текст
export const LABEL_FONT_SIZE = 22;
export const LABEL_LINE_HEIGHT = 1.35;
export const LABEL_PADDING = 16;
export const MIN_FONT_SIZE_RATIO = 0.35;
export const FONT_FIT_MIN_FONT_SIZE_PX = 6;
export const FONT_FIT_BINARY_SEARCH_STEPS = 10;

// Анимация флипа
export const ROTATION_DURATION_MS = 500;

// Кнопка "Перевернуть"
export const FLIP_BUTTON_MIN_SIZE_PX = 22;
export const FLIP_BUTTON_MAX_SIZE_PX = 36;
export const FLIP_BUTTON_SIZE_RATIO = 0.14;
export const FLIP_BUTTON_ZONE_GAP_PX = 16;

// Клик vs drag на грани карточки
export const FACE_CLICK_THRESHOLD_PX = 4;

// Зона картинки
export const DEFAULT_IMAGE_AREA_RATIO = 0.45;
export const MIN_IMAGE_AREA_RATIO = 0.2;
export const MAX_IMAGE_AREA_RATIO = 0.65;

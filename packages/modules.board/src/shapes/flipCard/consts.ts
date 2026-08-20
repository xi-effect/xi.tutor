import { DrRichText } from '@ibodr/schema';

export const BASE_CARD_WIDTH = 160;
export const BASE_CARD_HEIGHT = 260;
export const FLIP_CARD_MIN_SCALE = 0.5;
export const FLIP_CARD_MAX_SCALE = 3;

export const FLIP_CARD_MIN_WIDTH = BASE_CARD_WIDTH * FLIP_CARD_MIN_SCALE;
export const FLIP_CARD_MIN_HEIGHT = BASE_CARD_HEIGHT * FLIP_CARD_MIN_SCALE;
export const FLIP_CARD_MAX_WIDTH = BASE_CARD_WIDTH * FLIP_CARD_MAX_SCALE;
export const FLIP_CARD_MAX_HEIGHT = BASE_CARD_HEIGHT * FLIP_CARD_MAX_SCALE;

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
export const FLIP_BUTTON_SIZE_RATIO = 0.14;
export const FLIP_BUTTON_ZONE_GAP_PX = 16;
export const FLIP_BUTTON_MIN_SIZE_PX = FLIP_CARD_MIN_WIDTH * FLIP_BUTTON_SIZE_RATIO;
export const FLIP_BUTTON_MAX_SIZE_PX = FLIP_CARD_MAX_WIDTH * FLIP_BUTTON_SIZE_RATIO;
export const BUTTON_FONT_SIZE_RATIO = 0.4;
export const BUTTON_BORDER_RADIUS_RATIO = 0.35;

// Клик vs drag на грани карточки
export const FACE_CLICK_THRESHOLD_PX = 4;

// Зона картинки
export const DEFAULT_IMAGE_AREA_RATIO = 0.45;
export const MIN_IMAGE_AREA_RATIO = 0.2;
export const MAX_IMAGE_AREA_RATIO = 0.65;

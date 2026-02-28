/** Высота шапки приложения (top-16) */
export const HEADER_HEIGHT_PX = 64;
/** Тулбар доски сверху и снизу при работе на доске */
export const BOARD_TOP_TOOLBAR_PX = 64;
export const BOARD_BOTTOM_TOOLBAR_PX = 64;
/** Нижний отступ: при доске — тулбар доски, иначе общий отступ */
export const BOTTOM_OFFSET_BOARD_PX = BOARD_BOTTOM_TOOLBAR_PX;
export const BOTTOM_OFFSET_DEFAULT_PX = 16;
export const COMPACT_BOTTOM_BAR_PX = 40;
export const TILES_PADDING_PX = 16;

export const TILE_MIN_HEIGHT_PX = 120;
export const TILE_GAP_PX = 8;

/** Ширина панели компакт-ВКС; высота плитки 16:9 при этой ширине */
export const COMPACT_PANEL_WIDTH_PX = 320;
export const TILE_HEIGHT_16_9_PX = Math.round((COMPACT_PANEL_WIDTH_PX * 9) / 16); // 180

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

/** Вертикальный padding контейнера expanded-режима (p-1: 4px сверху + 4px снизу) */
export const EXPANDED_VIDEO_PADDING_VERTICAL_PX = 8;
/** Отступ между областью видео и нижней панелью (mb-2 на контейнере видео) */
export const COMPACT_VIDEO_AREA_MARGIN_PX = 8;
/** Нижний отступ compact call на странице доски, соответствует CSS bottom-[72px] */
export const COMPACT_BOTTOM_OFFSET_BOARD_PX = BOARD_BOTTOM_TOOLBAR_PX + TILE_GAP_PX; // 72

/** Ширина панели компакт-ВКС (с запасом под кнопку чата); высота плитки 16:9 при этой ширине */
export const COMPACT_PANEL_WIDTH_PX = 360;
export const TILE_HEIGHT_16_9_PX = Math.round((COMPACT_PANEL_WIDTH_PX * 9) / 16); // 203 при ширине 360

/** Размеры окна PiP Document */
export const PIP_PANEL_WIDTH_PX = 380;
export const PIP_BAR_HEIGHT_PX = 48;
/** Зазор между областью видео и нижней панелью в PiP (gap-1) */
export const PIP_VIDEO_BAR_GAP_PX = 4;
/** Внутренний вертикальный padding области плиток в PiP expanded (p-0.5) */
export const PIP_EXPANDED_INNER_PADDING_PX = 4;
/**
 * Высота, всегда резервируемая под панель и отступы в PiP (панель всегда видна).
 * bar + gap + outer padding + inner padding области плиток.
 */
export const PIP_RESERVED_HEIGHT_PX =
  PIP_BAR_HEIGHT_PX +
  PIP_VIDEO_BAR_GAP_PX +
  EXPANDED_VIDEO_PADDING_VERTICAL_PX +
  PIP_EXPANDED_INNER_PADDING_PX;
/** Высота одной плитки 16:9 при ширине PiP */
export const PIP_TILE_HEIGHT_16_9_PX = Math.round((PIP_PANEL_WIDTH_PX * 9) / 16);
/** Дополнительные 36px высоты при открытии/ресайзе PiP (basic и expanded) */
export const PIP_EXTRA_HEIGHT_PX = 36;
/** Ещё 12px при expanded (переключение basic → expanded) */
export const PIP_EXTRA_HEIGHT_EXPANDED_PX = 12;
/** Высота окна PiP в basic: панель + одна плитка 16:9 + padding */
export const PIP_HEIGHT_BASIC_PX =
  PIP_BAR_HEIGHT_PX + PIP_TILE_HEIGHT_16_9_PX + EXPANDED_VIDEO_PADDING_VERTICAL_PX;

/**
 * Высота окна PiP в expanded: панель + до 4 плиток 16:9 + зазоры + padding + доп. высота.
 * @param participantCount — число участников (локальный + удалённые)
 */
export function getPipHeightExpandedPx(participantCount: number): number {
  const n = Math.min(Math.max(1, participantCount), 4);
  return (
    PIP_BAR_HEIGHT_PX +
    n * PIP_TILE_HEIGHT_16_9_PX +
    (n - 1) * TILE_GAP_PX +
    EXPANDED_VIDEO_PADDING_VERTICAL_PX +
    PIP_EXTRA_HEIGHT_PX +
    PIP_EXTRA_HEIGHT_EXPANDED_PX
  );
}

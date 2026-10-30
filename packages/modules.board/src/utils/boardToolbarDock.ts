export type BoardToolbarDock = 'bottom' | 'left' | 'top' | 'right';

export const BOARD_TOOLBAR_DOCKS: readonly BoardToolbarDock[] = ['bottom', 'left', 'top', 'right'];

export const DEFAULT_BOARD_TOOLBAR_DOCK: BoardToolbarDock = 'bottom';

/**
 * Панель уезжает с низа только на десктопе.
 * Порог совпадает с десктопным CompactView (`max-width: 720px` — телефон).
 */
export const BOARD_TOOLBAR_DOCK_MEDIA = '(min-width: 721px)';

/** Отступ плавающих панелей от свободного края. */
export const BOARD_CHROME_EDGE_PX = 16;

/** Верх compact-звонка, когда сверху только шапка доски. Совпадает с `top-16`. */
export const BOARD_CHROME_TOP_PX = 64;

/**
 * Сколько края занимает прижатый тулбар.
 * Совпадает с `bottom-[72px]` compact-звонка на доске.
 */
export const BOARD_TOOLBAR_CLEARANCE_PX = 72;

/** Нижний запас под панель зума, когда тулбар не снизу. */
export const BOARD_ZOOM_CLEARANCE_PX = 64;

/** `left-22` минус `left-4`: чат стоит чуть дальше от левого края, чем звонок. */
export const BOARD_CHAT_LEFT_EXTRA_PX = 72;

/** Базовый `top` чата (`top-32`). */
export const BOARD_CHAT_TOP_PX = 128;

/** Вертикальный тулбар начинается ниже шапки и заканчивается выше зума. */
export const BOARD_SIDE_TOOLBAR_INSET_PX = 80;

export const BOARD_CHROME_TOP_VAR = '--board-chrome-top';
export const BOARD_CHROME_RIGHT_VAR = '--board-chrome-right';
export const BOARD_CHROME_BOTTOM_VAR = '--board-chrome-bottom';
export const BOARD_CHROME_LEFT_VAR = '--board-chrome-left';
export const BOARD_TOAST_BOTTOM_VAR = '--board-toast-bottom';
export const BOARD_TOAST_RIGHT_VAR = '--board-toast-right';
export const BOARD_TOOLBAR_DOCK_ATTR = 'data-board-toolbar-dock';

/** CompactView выставляет этот атрибут, когда сам читает CSS-переменные хрома. */
export const BOARD_CHROME_AWARE_ATTR = 'data-board-chrome-aware';

export type BoardChromeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type BoardChromeLayout = {
  /** Куда сейчас прижата панель. На узком экране всегда `bottom`. */
  dock: BoardToolbarDock;
  /** Можно ли рисовать боковую и верхнюю панель, а не нижнюю мобильную. */
  wide: boolean;
  /**
   * Верхнее положение — отражение хрома относительно горизонтали:
   * шапка и баннер уходят вниз, зум и панель инструментов — наверх.
   */
  mirrored: boolean;
  insets: BoardChromeInsets;
  /** Отступ шапки от её края (сверху или, в зеркале, снизу). */
  headerOffset: number;
  zoomRight: number;
  followOffset: number;
  debugLeft: number;
  debugOffset: number;
  toastRight: number;
  toastBottom: number;
  sideToolbarInset: number;
};

export function isVerticalToolbarDock(dock: BoardToolbarDock): boolean {
  return dock === 'left' || dock === 'right';
}

/** Куда открывать меню инструмента, чтобы оно не ложилось на панель. */
export function boardToolbarPopupSide(dock: BoardToolbarDock): 'top' | 'right' | 'bottom' | 'left' {
  switch (dock) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
      return 'bottom';
    default:
      return 'top';
  }
}

export function isBoardToolbarDock(value: unknown): value is BoardToolbarDock {
  return value === 'bottom' || value === 'left' || value === 'top' || value === 'right';
}

export function normalizeBoardToolbarDock(value: unknown): BoardToolbarDock {
  return isBoardToolbarDock(value) ? value : DEFAULT_BOARD_TOOLBAR_DOCK;
}

export function resolveEffectiveToolbarDock(
  stored: BoardToolbarDock,
  wideLayout: boolean,
): BoardToolbarDock {
  return wideLayout ? stored : 'bottom';
}

export function resolveBoardChrome(options: {
  dock: BoardToolbarDock;
  toolbarVisible: boolean;
  wide: boolean;
}): BoardChromeLayout {
  const dock = options.toolbarVisible ? options.dock : 'bottom';
  const edge = BOARD_CHROME_EDGE_PX;
  const mirrored = dock === 'top' && options.toolbarVisible;
  const sideClearance =
    options.toolbarVisible && (dock === 'left' || dock === 'right')
      ? BOARD_TOOLBAR_CLEARANCE_PX - edge
      : 0;

  const insets: BoardChromeInsets = {
    top: mirrored ? BOARD_TOOLBAR_CLEARANCE_PX : BOARD_CHROME_TOP_PX,
    right: edge + (dock === 'right' ? sideClearance : 0),
    bottom: mirrored
      ? BOARD_CHROME_TOP_PX
      : dock === 'bottom' && options.toolbarVisible
        ? BOARD_TOOLBAR_CLEARANCE_PX
        : BOARD_ZOOM_CLEARANCE_PX,
    left: edge + (dock === 'left' ? sideClearance : 0),
  };

  return {
    dock,
    wide: options.wide,
    mirrored,
    insets,
    headerOffset: edge,
    zoomRight: insets.right,
    followOffset: 4,
    debugLeft: dock === 'left' && options.toolbarVisible ? insets.left : 12,
    debugOffset: !mirrored && dock === 'bottom' && options.toolbarVisible ? insets.bottom : 12,
    toastRight: insets.right,
    toastBottom: mirrored ? BOARD_CHROME_TOP_PX : BOARD_ZOOM_CLEARANCE_PX,
    sideToolbarInset: BOARD_SIDE_TOOLBAR_INSET_PX,
  };
}

export function boardChatTop(insets: BoardChromeInsets): number {
  return BOARD_CHAT_TOP_PX + Math.max(0, insets.top - BOARD_CHROME_TOP_PX);
}

const COMPACT_POSITION_TOKENS = ['top-16', 'top-32', 'bottom-18', 'bottom-[72px]', 'left-22'];

export type CompactChromeEdge = 'top' | 'right' | 'bottom' | 'left';

/** Инлайн-отступы для текущего CompactView, который ещё позиционируется utility-классами. */
export function compactChromeOverrides(
  className: string,
  insets: BoardChromeInsets,
): Partial<Record<CompactChromeEdge, string>> | null {
  const tokens = new Set(className.split(/\s+/).filter(Boolean));
  if (!tokens.has('z-100') && !tokens.has('z-20')) return null;
  if (!tokens.has('absolute') && !tokens.has('fixed')) return null;

  const knownCorner =
    COMPACT_POSITION_TOKENS.some((token) => tokens.has(token)) ||
    (tokens.has('bottom-4') && (tokens.has('left-4') || tokens.has('right-4')));
  if (!knownCorner) return null;

  const overrides: Partial<Record<CompactChromeEdge, string>> = {};

  if (tokens.has('top-16')) overrides.top = `${insets.top}px`;
  if (tokens.has('top-32')) overrides.top = `${boardChatTop(insets)}px`;
  if (tokens.has('left-4')) overrides.left = `${insets.left}px`;
  if (tokens.has('left-22')) overrides.left = `${insets.left + BOARD_CHAT_LEFT_EXTRA_PX}px`;
  if (tokens.has('right-4')) overrides.right = `${insets.right}px`;
  if (tokens.has('bottom-[72px]') || tokens.has('bottom-18') || tokens.has('bottom-4')) {
    overrides.bottom = `${insets.bottom}px`;
  }

  return Object.keys(overrides).length > 0 ? overrides : null;
}

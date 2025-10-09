/**
 * Конфигурация для адаптивной сетки пользователей в ВКС
 * Оптимизирована для соотношения сторон 1:1 и всех устройств
 */

export interface GridLayoutConfig {
  columns: number;
  rows: number;
  minTiles: number;
  maxTiles: number;
  minWidth: number;
  minHeight: number;
  name: string;
}

export const GRID_CONFIG = {
  // Размеры тайлов с соотношением сторон 1:1
  TILE: {
    HEIGHT: 200,
    WIDTH: 200,
    MIN_HEIGHT: 120,
    MIN_WIDTH: 120,
    ASPECT_RATIO: 1, // Квадратные плитки
  },

  // Брейкпоинты для адаптивности
  BREAKPOINTS: {
    xs: 360, // Мобильные телефоны
    sm: 640, // Планшеты
    md: 768, // Небольшие десктопы
    lg: 1024, // Десктопы
    xl: 1280, // Большие экраны
    '2xl': 1536, // Очень большие экраны
  },

  // Максимальное количество тайлов на странице
  MAX_TILES_PER_PAGE: {
    xs: 1,
    sm: 4,
    md: 6,
    lg: 9,
    xl: 12,
    '2xl': 16,
  },

  // Настройки пагинации
  PAGINATION: {
    SWIPE_THRESHOLD: 50,
    AUTO_HIDE_DELAY: 2000,
  },

  // Настройки карусели
  CAROUSEL: {
    SCROLL_BAR_WIDTH: 17,
    MIN_VISIBLE_TILES: 1,
  },
} as const;

/**
 * Кастомные конфигурации gridLayouts для адаптивной сетки
 * Основано на рекомендациях LiveKit для соотношения сторон 1:1
 */
export const CUSTOM_GRID_LAYOUTS: GridLayoutConfig[] = [
  // 1 участник - полноэкранный режим
  {
    columns: 1,
    rows: 1,
    minTiles: 1,
    maxTiles: 1,
    minWidth: 0,
    minHeight: 0,
    name: 'single-participant',
  },

  // 2 участника - горизонтальная линия
  {
    columns: 2,
    rows: 1,
    minTiles: 2,
    maxTiles: 2,
    minWidth: 0,
    minHeight: 0,
    name: 'two-participants',
  },

  // 3-4 участника - квадрат 2x2
  {
    columns: 2,
    rows: 2,
    minTiles: 3,
    maxTiles: 4,
    minWidth: 0,
    minHeight: 0,
    name: 'small-grid',
  },

  // 5-6 участников - 3x2 (оптимально для средних экранов)
  {
    columns: 3,
    rows: 2,
    minTiles: 5,
    maxTiles: 6,
    minWidth: 0,
    minHeight: 0,
    name: 'medium-grid',
  },

  // 7-9 участников - квадрат 3x3
  {
    columns: 3,
    rows: 3,
    minTiles: 7,
    maxTiles: 9,
    minWidth: 0,
    minHeight: 0,
    name: 'large-grid',
  },

  // 10-12 участников - 4x3
  {
    columns: 4,
    rows: 3,
    minTiles: 10,
    maxTiles: 12,
    minWidth: 0,
    minHeight: 0,
    name: 'wide-grid',
  },

  // 13-16 участников - квадрат 4x4
  {
    columns: 4,
    rows: 4,
    minTiles: 13,
    maxTiles: 16,
    minWidth: 0,
    minHeight: 0,
    name: 'full-grid',
  },
];

/**
 * Конфигурации для мобильных устройств
 */
export const MOBILE_GRID_LAYOUTS: GridLayoutConfig[] = [
  // 1 участник
  {
    columns: 1,
    rows: 1,
    minTiles: 1,
    maxTiles: 1,
    minWidth: 0,
    minHeight: 0,
    name: 'mobile-single',
  },

  // 2-4 участника - вертикальная колонка
  {
    columns: 1,
    rows: 4,
    minTiles: 2,
    maxTiles: 4,
    minWidth: 0,
    minHeight: 0,
    name: 'mobile-vertical',
  },

  // 5-6 участников - 2x3
  {
    columns: 2,
    rows: 3,
    minTiles: 5,
    maxTiles: 6,
    minWidth: 0,
    minHeight: 0,
    name: 'mobile-small-grid',
  },

  // 7-9 участников - 3x3
  {
    columns: 3,
    rows: 3,
    minTiles: 7,
    maxTiles: 9,
    minWidth: 0,
    minHeight: 0,
    name: 'mobile-grid',
  },
];

/**
 * Конфигурации для планшетов
 */
export const TABLET_GRID_LAYOUTS: GridLayoutConfig[] = [
  // 1-2 участника
  {
    columns: 2,
    rows: 1,
    minTiles: 1,
    maxTiles: 2,
    minWidth: 0,
    minHeight: 0,
    name: 'tablet-small',
  },

  // 3-4 участника - 2x2
  {
    columns: 2,
    rows: 2,
    minTiles: 3,
    maxTiles: 4,
    minWidth: 0,
    minHeight: 0,
    name: 'tablet-medium',
  },

  // 5-6 участников - 3x2
  {
    columns: 3,
    rows: 2,
    minTiles: 5,
    maxTiles: 6,
    minWidth: 0,
    minHeight: 0,
    name: 'tablet-large',
  },

  // 7-9 участников - 3x3
  {
    columns: 3,
    rows: 3,
    minTiles: 7,
    maxTiles: 9,
    minWidth: 0,
    minHeight: 0,
    name: 'tablet-grid',
  },
];

/**
 * Функция для выбора подходящей конфигурации на основе размера экрана
 */
export const getGridLayoutsForScreen = (screenWidth: number): GridLayoutConfig[] => {
  if (screenWidth < 640) {
    return MOBILE_GRID_LAYOUTS;
  } else if (screenWidth < 1024) {
    return TABLET_GRID_LAYOUTS;
  } else {
    return CUSTOM_GRID_LAYOUTS;
  }
};

/**
 * Функция для получения оптимальной конфигурации для конкретного количества участников
 */
export const getOptimalGridLayout = (
  participantCount: number,
  screenWidth: number,
): GridLayoutConfig | null => {
  const layouts = getGridLayoutsForScreen(screenWidth);

  const suitableLayout = layouts.find(
    (layout) => participantCount >= layout.minTiles && participantCount <= layout.maxTiles,
  );

  if (suitableLayout) {
    return suitableLayout;
  }

  return layouts[layouts.length - 1] || null;
};

export type GridBreakpoint = keyof typeof GRID_CONFIG.BREAKPOINTS;
export type GridConfig = typeof GRID_CONFIG;

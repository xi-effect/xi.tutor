export const PRODUCT_NAME = 'Sovlium';
export const APP_ID = 'ru.sovlium.electron.dev';
export const PARTITION = 'persist:sovlium';
export const APP_ORIGIN = 'https://app.sovlium.ru';
export const APP_HOST = 'app.sovlium.ru';
export const DEEP_LINK_SCHEME = 'sovlium';

export const DEFAULT_WINDOW = {
  width: 1280,
  height: 800,
  minWidth: 1024,
  minHeight: 640,
} as const;

export const COMPACT_CONFERENCE = {
  width: 380,
  height: 240,
} as const;

export const FLOATING_CONFERENCE = {
  width: 380,
  height: 280,
  minWidth: 280,
  minHeight: 160,
} as const;

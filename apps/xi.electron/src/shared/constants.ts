export const PRODUCT_NAME = 'Sovlium';

/** GitHub Releases feed for the Electron shell. Tags are `electron-vX.Y.Z`. */
export const ELECTRON_GITHUB_RELEASE = {
  owner: 'xi-effect',
  repo: 'xi.tutor',
  tagPrefix: 'electron-v',
} as const;
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

export const FLOATING_CONFERENCE = {
  width: 380,
  height: 316,
  minWidth: 280,
  minHeight: 196,
} as const;

export const PIP_CHROME_HEIGHT = 36;

/** Must match `CALL_OVERLAY_FRAME_NAME` in common.platform electronCallOverlay.ts. */
export const CALL_OVERLAY_FRAME_NAME = 'sovlium-call-overlay';

/** Frame-name prefixes; must match common.platform electronShareAnnotations.ts. */
export const SHARE_ANNOTATION_CANVAS_FRAME_NAME = 'sovlium-share-annotation-canvas';
export const SHARE_ANNOTATION_TOOLBAR_FRAME_NAME = 'sovlium-share-annotation-toolbar';
export const SHARE_ANNOTATION_TOOLBAR_SIZE = { width: 520, height: 52 } as const;
/** The toolbar window follows its content, within these limits. */
export const SHARE_ANNOTATION_TOOLBAR_LIMITS = {
  minWidth: 280,
  maxWidth: 720,
  maxHeight: 420,
} as const;

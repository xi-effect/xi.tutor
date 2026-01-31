export type ScreenShareDiagnostics = {
  timestamp: string;

  href: string;
  origin: string;
  isSecureContext: boolean;

  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser' | 'unknown';
  isStandalone: boolean;
  isStandaloneIOSLegacy: boolean;
  hasOpener: boolean;

  isInIframe: boolean;
  isTopLevel: boolean;

  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  maxTouchPoints: number;
  isTouchLike: boolean;

  looksLikeIPad: boolean;

  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasGetDisplayMedia: boolean;

  permissionsApiAvailable: boolean;
  permissionCamera?: PermissionState | 'unknown';
  permissionMicrophone?: PermissionState | 'unknown';

  hasServiceWorker: boolean;
  hasSWController: boolean;

  storage: {
    localStorageAvailable: boolean;
    sessionStorageAvailable: boolean;
    indexedDbAvailable: boolean;
  };

  app?: {
    buildId?: string;
    version?: string;
    gitSha?: string;
  };

  screenShareAvailability: {
    canAttempt: boolean;
    reasons: string[];
  };
};

function safeBool(fn: () => boolean): boolean {
  try {
    return !!fn();
  } catch {
    return false;
  }
}

function getDisplayMode(): ScreenShareDiagnostics['displayMode'] {
  if (typeof window === 'undefined' || !window.matchMedia) return 'unknown';

  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: browser)').matches) return 'browser';
  return 'unknown';
}

type PermissionNameCamera = 'camera' | 'microphone';

async function queryPermission(
  name: PermissionName | PermissionNameCamera,
): Promise<PermissionState | 'unknown'> {
  try {
    const p = await navigator.permissions.query({ name } as PermissionDescriptor);
    return p.state;
  } catch {
    return 'unknown';
  }
}

export type ScreenShareDiagnosticsParams = {
  app?: ScreenShareDiagnostics['app'];
};

/**
 * Собирает полную диагностику для понимания:
 * - почему нет кнопки screen share
 * - PWA ли это
 * - secure context ли это
 */
export async function collectScreenShareDiagnostics(
  params?: ScreenShareDiagnosticsParams,
): Promise<ScreenShareDiagnostics> {
  const now = new Date();

  const href = typeof location !== 'undefined' ? location.href : '';
  const origin = typeof location !== 'undefined' ? location.origin : '';
  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;

  const displayMode = getDisplayMode();
  const isStandalone = displayMode === 'standalone' || displayMode === 'fullscreen';

  const isStandaloneIOSLegacy: boolean =
    typeof navigator !== 'undefined' &&
    typeof (navigator as Navigator & { standalone?: boolean }).standalone === 'boolean'
      ? !!(navigator as Navigator & { standalone?: boolean }).standalone
      : false;

  const isInIframe = safeBool(() => window.top !== window.self);
  const isTopLevel = !isInIframe;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform =
    typeof navigator !== 'undefined'
      ? ((navigator as Navigator & { platform?: string }).platform ?? '')
      : '';
  const vendor = typeof navigator !== 'undefined' ? (navigator.vendor ?? '') : '';
  const language = typeof navigator !== 'undefined' ? (navigator.language ?? '') : '';
  const languages = typeof navigator !== 'undefined' ? Array.from(navigator.languages ?? []) : [];

  const maxTouchPoints = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints ?? 0) : 0;
  const isTouchLike = maxTouchPoints > 0;

  const looksLikeIPad = /Macintosh/.test(ua) && maxTouchPoints > 1;

  const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  const hasMediaDevices = !!md;
  const hasGetUserMedia = !!md?.getUserMedia;
  const hasGetDisplayMedia = !!md?.getDisplayMedia;

  const permissionsApiAvailable =
    typeof navigator !== 'undefined' && !!navigator.permissions?.query;

  const permissionResult = await Promise.all([
    permissionsApiAvailable ? queryPermission('camera') : Promise.resolve('unknown' as const),
    permissionsApiAvailable ? queryPermission('microphone') : Promise.resolve('unknown' as const),
  ]);
  const permissionCamera: PermissionState | 'unknown' = permissionResult[0];
  const permissionMicrophone: PermissionState | 'unknown' = permissionResult[1];

  const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const hasSWController = hasServiceWorker ? !!navigator.serviceWorker.controller : false;

  const storage = {
    localStorageAvailable: safeBool(() => !!window.localStorage),
    sessionStorageAvailable: safeBool(() => !!window.sessionStorage),
    indexedDbAvailable: typeof indexedDB !== 'undefined',
  };

  const reasons: string[] = [];
  if (!isSecureContext) reasons.push('not_secure_context');
  if (!hasMediaDevices) reasons.push('no_mediaDevices');
  if (hasMediaDevices && !hasGetDisplayMedia) reasons.push('no_getDisplayMedia');
  if (isInIframe) reasons.push('in_iframe_maybe_policy');
  if (isStandalone || isStandaloneIOSLegacy) reasons.push('pwa_standalone_mode');
  if (looksLikeIPad) reasons.push('ipad_desktop_ua');

  const canAttempt = isSecureContext && hasMediaDevices && hasGetDisplayMedia;

  return {
    timestamp: now.toISOString(),

    href,
    origin,
    isSecureContext,

    displayMode,
    isStandalone,
    isStandaloneIOSLegacy,
    hasOpener: typeof window !== 'undefined' ? !!window.opener : false,

    isInIframe,
    isTopLevel,

    userAgent: ua,
    platform,
    vendor,
    language,
    languages,
    maxTouchPoints,
    isTouchLike,

    looksLikeIPad,

    hasMediaDevices,
    hasGetUserMedia,
    hasGetDisplayMedia,

    permissionsApiAvailable,
    permissionCamera,
    permissionMicrophone,

    hasServiceWorker,
    hasSWController,

    storage,

    app: params?.app,

    screenShareAvailability: {
      canAttempt,
      reasons: canAttempt ? [] : reasons,
    },
  };
}

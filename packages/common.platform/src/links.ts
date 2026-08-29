import { isDesktopNative, isNativeShell } from './detect';

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tg:', 'telegram:']);

export function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Opens a URL. In the native shell, http(s) outside the WebView allowlist
 * (and mailto/tg) go through the OS opener so they never spawn a trapped
 * popup WebView. In the browser this is `window.open`.
 */
export async function openUrl(url: string): Promise<void> {
  if (isNativeShell()) {
    try {
      let href = url;
      try {
        href = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined).href;
      } catch {
        href = url;
      }
      const protocol = (() => {
        try {
          return new URL(href).protocol;
        } catch {
          return '';
        }
      })();
      if (SAFE_SCHEMES.has(protocol) || protocol === '') {
        const { openUrl: openWithOs } = await import('@tauri-apps/plugin-opener');
        await openWithOs(href);
        return;
      }
    } catch (err) {
      console.warn('[common.platform] openUrl native failed, falling back', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/** True when Telegram-style "open blank tab then assign href" should be skipped. */
export function shouldSkipBlankPopup(): boolean {
  return isDesktopNative() || isNativeShell();
}

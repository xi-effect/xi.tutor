/**
 * Electron has no working Document Picture-in-Picture (electron/electron#39633).
 *
 * The shim opens a same-origin `window.open('')` popup instead; the shell turns it
 * into a frameless always-on-top panel (apps/xi.electron/src/main/call-pip.ts).
 * CompactView portals its PiP call UI into it, so video keeps playing from the
 * opener's MediaStreams — the same approach Discord uses for pop-outs.
 */

import { focusAppWindow } from './window';

/** Must match `CALL_OVERLAY_FRAME_NAME` in apps/xi.electron/src/shared/constants.ts. */
export const CALL_OVERLAY_FRAME_NAME = 'sovlium-call-overlay';
export const CALL_OVERLAY_CHANGE_EVENT = 'sovlium:call-overlay-change';

/** CompactView sizes the window with 32px reserved for the Chrome PiP title bar. */
const TITLE_BAR_HEIGHT_PX = 32;
const OVERLAY_STYLE_ID = 'sovlium-call-overlay-style';
const OVERLAY_MARGIN_PX = 24;

const OVERLAY_CSS = `
html {
  margin-top: ${TITLE_BAR_HEIGHT_PX}px !important;
  overflow: hidden !important;
  background: var(--xi-background-page, #1e1f22);
}
.sovlium-call-overlay-bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: ${TITLE_BAR_HEIGHT_PX}px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px 0 12px;
  box-sizing: border-box;
  background: var(--xi-background-surface, #2b2d31);
  color: var(--xi-text-primary, #f2f3f5);
  border-bottom: 1px solid var(--xi-border-default, rgba(255, 255, 255, 0.08));
  font: 500 12px/1 system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  cursor: default;
}
.sovlium-call-overlay-bar__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.8;
}
.sovlium-call-overlay-bar__button {
  -webkit-app-region: no-drag;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.sovlium-call-overlay-bar__button:hover {
  background: rgba(127, 127, 127, 0.22);
}
body button,
body a,
body input,
body textarea,
body select,
body [role='button'],
body [role='slider'],
body [contenteditable='true'] {
  -webkit-app-region: no-drag;
}
`;

const ICON_RETURN =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4l-8 8"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

interface PipRequestOptions {
  width?: number;
  height?: number;
}

let overlay: Window | null = null;

function emitChange(): void {
  window.dispatchEvent(new Event(CALL_OVERLAY_CHANGE_EVENT));
}

function activeOverlay(): Window | null {
  if (overlay && overlay.closed) overlay = null;
  return overlay;
}

/** Content (below the title bar) is what CompactView lays out into. */
function reserveTitleBar(popup: Window): void {
  const descriptor = Object.getOwnPropertyDescriptor(popup, 'innerHeight');
  const read = descriptor?.get;
  if (!read) return;
  try {
    Object.defineProperty(popup, 'innerHeight', {
      configurable: true,
      get: () => Math.max(0, (read.call(popup) as number) - TITLE_BAR_HEIGHT_PX),
    });
  } catch {
    // Title bar then overlaps the top of the call UI; still usable.
  }
}

function button(
  doc: Document,
  label: string,
  icon: string,
  onClick: () => void,
): HTMLButtonElement {
  const el = doc.createElement('button');
  el.type = 'button';
  el.className = 'sovlium-call-overlay-bar__button';
  el.title = label;
  el.setAttribute('aria-label', label);
  el.innerHTML = icon;
  el.addEventListener('click', onClick);
  return el;
}

function prepareOverlay(popup: Window): void {
  const doc = popup.document;
  doc.title = 'Звонок — Sovlium';

  if (!doc.getElementById(OVERLAY_STYLE_ID)) {
    const style = doc.createElement('style');
    style.id = OVERLAY_STYLE_ID;
    style.textContent = OVERLAY_CSS;
    doc.head.appendChild(style);
  }

  const bar = doc.createElement('div');
  bar.className = 'sovlium-call-overlay-bar';
  const title = doc.createElement('span');
  title.className = 'sovlium-call-overlay-bar__title';
  title.textContent = 'Звонок';
  bar.append(
    title,
    button(doc, 'Вернуться в приложение', ICON_RETURN, () => {
      void focusAppWindow();
      popup.close();
    }),
    button(doc, 'Закрыть плавающее окно', ICON_CLOSE, () => popup.close()),
  );
  doc.documentElement.appendChild(bar);

  reserveTitleBar(popup);
}

function requestWindow(options: PipRequestOptions = {}): Promise<Window> {
  const existing = activeOverlay();
  if (existing) {
    existing.focus();
    return Promise.resolve(existing);
  }

  const width = Math.round(options.width ?? 380);
  const height = Math.round(options.height ?? 270);
  const screenArea = window.screen as Screen & { availLeft?: number; availTop?: number };
  const left = Math.round(
    (screenArea.availLeft ?? 0) + screenArea.availWidth - width - OVERLAY_MARGIN_PX,
  );
  const top = Math.round(
    (screenArea.availTop ?? 0) + screenArea.availHeight - height - OVERLAY_MARGIN_PX,
  );
  const popup = window.open(
    '',
    CALL_OVERLAY_FRAME_NAME,
    `popup,width=${width},height=${height},left=${left},top=${top}`,
  );
  if (!popup) {
    return Promise.reject(new DOMException('Call overlay window was blocked', 'NotAllowedError'));
  }

  prepareOverlay(popup);
  overlay = popup;
  popup.addEventListener('pagehide', () => {
    if (overlay !== popup) return;
    overlay = null;
    emitChange();
  });
  emitChange();
  return Promise.resolve(popup);
}

export function isElectronCallOverlayOpen(): boolean {
  return activeOverlay() !== null;
}

export function closeElectronCallOverlay(): void {
  activeOverlay()?.close();
}

let installed = false;

export function installElectronCallOverlayShim(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  // Electron exposes Blink's `documentPictureInPicture` in secure contexts, but
  // `requestWindow` never opens anything there — always shadow it.

  Object.defineProperty(window, 'documentPictureInPicture', {
    configurable: true,
    value: {
      requestWindow,
      get window() {
        return activeOverlay();
      },
    },
  });

  window.addEventListener('pagehide', () => {
    closeElectronCallOverlay();
  });
}

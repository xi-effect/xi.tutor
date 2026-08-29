/**
 * Makes CompactView's existing Document PiP button work in the native shell.
 *
 * `documentPictureInPicture` is a Chrome-only API (same JS context, extra
 * window). Tauri WebViews do not ship it. We expose a compatible stub that:
 *   - enters the always-on-top mini window (`call_pip_*`)
 *   - portals PiPCompactCall into a host overlay in the *same* document
 *     (so LiveKit tracks keep working)
 */

import { isDesktopNative } from './detect';
import { enterCallPip, leaveCallPip, onCallPipRestored, resizeCallPip } from './callPip';

const HOST_ID = 'sovlium-native-call-pip';
const STYLE_ID = 'sovlium-native-call-pip-style';

type PipListener = EventListenerOrEventListenerObject;

type FakePipWindow = Window & {
  __sovliumNativePip?: true;
};

let activeWindow: FakePipWindow | null = null;
let leaving = false;

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html[data-native-call-pip] #root {
      overflow: hidden;
    }
    #${HOST_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      display: flex;
      flex-direction: column;
      background: var(--color-background-page, var(--xi-gray-0, #111318));
      color: inherit;
      overflow: hidden;
    }
    #${HOST_ID} .sovlium-native-call-pip__chrome {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 6px;
      pointer-events: none;
      -webkit-app-region: drag;
      app-region: drag;
    }
    #${HOST_ID} .sovlium-native-call-pip__chrome button {
      pointer-events: auto;
      appearance: none;
      border: 0;
      border-radius: 8px;
      width: 22px;
      height: 22px;
      font-size: 13px;
      line-height: 1;
      cursor: pointer;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      -webkit-app-region: no-drag;
      app-region: no-drag;
    }
    #${HOST_ID} .sovlium-native-call-pip__body {
      flex: 1;
      min-height: 0;
      height: 100%;
    }
    #${HOST_ID} button,
    #${HOST_ID} a,
    #${HOST_ID} input,
    #${HOST_ID} textarea,
    #${HOST_ID} video,
    #${HOST_ID} [role='button'] {
      -webkit-app-region: no-drag;
      app-region: no-drag;
    }
  `;
  document.head.appendChild(style);
}

function toHandler(listener: PipListener): (event: Event) => void {
  if (typeof listener === 'function') return listener;
  return (event) => listener.handleEvent(event);
}

function createFakePipWindow(
  body: HTMLElement,
  initial: { width: number; height: number },
  onClose: () => void,
): FakePipWindow {
  let width = initial.width;
  let height = initial.height;
  let closed = false;
  const resizeListeners = new Set<(event: Event) => void>();
  const pagehideListeners = new Set<(event: Event) => void>();

  const fakeDocument = {
    documentElement: body,
    body,
    head: document.createElement('head'),
    styleSheets: document.styleSheets,
    fonts: document.fonts,
    createElement: document.createElement.bind(document),
  };

  const fake = {
    __sovliumNativePip: true as const,
    document: fakeDocument,
    get innerWidth() {
      return width;
    },
    get innerHeight() {
      return height;
    },
    resizeTo(nextWidth?: number, nextHeight?: number) {
      width = Math.round(nextWidth ?? width);
      height = Math.round(nextHeight ?? height);
      void resizeCallPip({ width, height }).then((applied) => {
        width = applied.width;
        height = applied.height;
        const event = new Event('resize');
        resizeListeners.forEach((fn) => fn(event));
      });
    },
    addEventListener(type: string, listener: PipListener) {
      const handler = toHandler(listener);
      if (type === 'resize') resizeListeners.add(handler);
      if (type === 'pagehide') pagehideListeners.add(handler);
    },
    removeEventListener(type: string, listener: PipListener) {
      const handler = toHandler(listener);
      if (type === 'resize') resizeListeners.delete(handler);
      if (type === 'pagehide') pagehideListeners.delete(handler);
    },
    close() {
      if (closed) return;
      closed = true;
      pagehideListeners.forEach((fn) => fn(new Event('pagehide')));
      onClose();
    },
  };

  return fake as unknown as FakePipWindow;
}

async function teardownHost(leaveNative: boolean): Promise<void> {
  if (leaving) return;
  leaving = true;
  try {
    document.documentElement.removeAttribute('data-native-call-pip');
    document.getElementById(HOST_ID)?.remove();
    activeWindow = null;
    if (leaveNative) {
      await leaveCallPip().catch((err) => {
        console.warn('[common.platform] leaveCallPip failed', err);
      });
    }
  } finally {
    leaving = false;
  }
}

function mountHost(): { host: HTMLElement; body: HTMLElement; restore: HTMLButtonElement } {
  ensureStyles();
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;

  const chrome = document.createElement('div');
  chrome.className = 'sovlium-native-call-pip__chrome';
  chrome.setAttribute('data-tauri-drag-region', '');

  const restore = document.createElement('button');
  restore.type = 'button';
  restore.title = 'Вернуть в приложение';
  restore.setAttribute('aria-label', 'Вернуть в приложение');
  restore.textContent = '↗';
  chrome.appendChild(restore);

  const body = document.createElement('div');
  body.className = 'sovlium-native-call-pip__body';

  host.appendChild(chrome);
  host.appendChild(body);
  document.body.appendChild(host);
  document.documentElement.setAttribute('data-native-call-pip', 'true');
  return { host, body, restore };
}

function installRequestWindow(): void {
  const api = {
    get window() {
      return activeWindow;
    },
    async requestWindow(options?: { width?: number; height?: number }): Promise<Window> {
      if (activeWindow) return activeWindow;

      const requested = {
        width: Math.round(options?.width ?? 380),
        height: Math.round(options?.height ?? 300),
      };
      // CompactView's `openPiP` swallows every rejection, so without this log a
      // broken bridge is indistinguishable from "the button does nothing".
      const applied = await enterCallPip(requested).catch((err) => {
        console.error('[common.platform] enterCallPip failed', err);
        throw err;
      });
      const { body, restore } = mountHost();

      const fake = createFakePipWindow(body, applied, () => {
        void teardownHost(true);
      });
      restore.addEventListener('click', () => {
        fake.close();
      });
      activeWindow = fake;
      return fake;
    },
  };

  Object.defineProperty(window, 'documentPictureInPicture', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: api,
  });
}

/**
 * CompactView closes Chrome PiP when the opener tab becomes visible again.
 * The native mini window *is* the opener — ignore that visibilitychange.
 */
function suppressOpenerVisibilityClose(): void {
  document.addEventListener(
    'visibilitychange',
    (event) => {
      if (!activeWindow) return;
      event.stopImmediatePropagation();
    },
    true,
  );
}

export function installNativeDocumentPipShim(): void {
  if (!isDesktopNative()) return;
  if ('documentPictureInPicture' in window && !activeWindow) {
    // WebView might already expose a stub; native always-on-top still wins.
  }
  installRequestWindow();
  suppressOpenerVisibilityClose();

  void onCallPipRestored(() => {
    activeWindow?.close();
  });
}

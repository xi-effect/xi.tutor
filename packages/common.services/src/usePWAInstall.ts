import { useCallback, useEffect, useState } from 'react';
import { isPWA } from './notifications/webNotifications';

/** Событие «установить приложение» (Chrome, Edge и др.). Не в стандартных DOM-типах. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/** Экспериментальный Web Install API (Chrome/Edge 143+, origin trial). */
interface NavigatorWithInstall extends Navigator {
  install?: () => Promise<void>;
}

export type PwaInstallHintKey =
  | 'generic'
  | 'ios'
  | 'androidChrome'
  | 'android'
  | 'desktopChrome'
  | 'safari'
  | 'firefox'
  | 'fallback';

const hasInstallAPI = (): boolean =>
  typeof navigator !== 'undefined' &&
  typeof (navigator as NavigatorWithInstall).install === 'function';

/** Определение платформы/браузера для ключа подсказки по установке PWA */
function getPlatformInstallHintKey(): PwaInstallHintKey {
  if (typeof navigator === 'undefined') {
    return 'generic';
  }
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isChrome = /Chrome|Chromium/.test(ua) && !/Edg/.test(ua);
  const isEdge = /Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);

  if (isIOS) {
    return 'ios';
  }
  if (isAndroid) {
    if (isChrome || isEdge) {
      return 'androidChrome';
    }
    return 'android';
  }
  if (isChrome || isEdge) {
    return 'desktopChrome';
  }
  if (isSafari) {
    return 'safari';
  }
  if (isFirefox) {
    return 'firefox';
  }
  return 'fallback';
}

export interface UsePWAInstallReturn {
  /** Можно показать кнопку установки (есть событие и приложение ещё не установлено) */
  canInstall: boolean;
  /** Вызвать диалог установки (по жесту пользователя) */
  promptInstall: () => Promise<void>;
  /** Приложение уже запущено как установленное PWA */
  isInstalled: boolean;
  /** Ключ подсказки для toast при !canInstall — переводится в UI через i18n */
  installHintKey: PwaInstallHintKey;
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isPWA());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Событие могло прийти до монтирования — читаем из глобала (выставляется в index.html)
    const win = window as Window & { __beforeInstallPrompt?: BeforeInstallPromptEvent | null };
    if (win.__beforeInstallPrompt) {
      setInstallEvent(win.__beforeInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      win.__beforeInstallPrompt = ev;
      setInstallEvent(ev);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const promptInstall = useCallback(async () => {
    const win = window as Window & { __beforeInstallPrompt?: BeforeInstallPromptEvent | null };
    const ev = installEvent ?? win.__beforeInstallPrompt;

    if (ev) {
      await ev.prompt();
      await ev.userChoice;
      win.__beforeInstallPrompt = null;
      setInstallEvent(null);
    } else if (hasInstallAPI()) {
      await (navigator as NavigatorWithInstall).install!();
    } else {
      return;
    }
    setInstalled(isPWA());
  }, [installEvent]);

  const win =
    typeof window !== 'undefined'
      ? (window as Window & { __beforeInstallPrompt?: BeforeInstallPromptEvent | null })
      : null;
  const hasPrompt = Boolean(installEvent ?? win?.__beforeInstallPrompt);
  const canInstall = (hasPrompt || hasInstallAPI()) && !installed;
  const installHintKey = getPlatformInstallHintKey();

  return { canInstall, promptInstall, isInstalled: installed, installHintKey };
};

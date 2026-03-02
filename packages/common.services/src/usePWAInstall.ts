import { useCallback, useEffect, useState } from 'react';
import { isPWA } from './notifications/webNotifications';

/** Событие «установить приложение» (Chrome, Edge и др.). Не в стандартных DOM-типах. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface UsePWAInstallReturn {
  /** Можно показать кнопку установки (есть событие и приложение ещё не установлено) */
  canInstall: boolean;
  /** Вызвать диалог установки (по жесту пользователя) */
  promptInstall: () => Promise<void>;
  /** Приложение уже запущено как установленное PWA */
  isInstalled: boolean;
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
    if (!ev) return;
    await ev.prompt();
    await ev.userChoice;
    win.__beforeInstallPrompt = null;
    setInstallEvent(null);
    setInstalled(isPWA());
  }, [installEvent]);

  const win =
    typeof window !== 'undefined'
      ? (window as Window & { __beforeInstallPrompt?: BeforeInstallPromptEvent | null })
      : null;
  const hasPrompt = Boolean(installEvent ?? win?.__beforeInstallPrompt);
  const canInstall = hasPrompt && !installed;

  return { canInstall, promptInstall, isInstalled: installed };
};

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

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null); // после выбора диалог больше не показывают
    setInstalled(isPWA());
  }, [installEvent]);

  const canInstall = Boolean(installEvent && !installed);

  return { canInstall, promptInstall, isInstalled: installed };
};

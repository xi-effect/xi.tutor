import { useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalFooter,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { usePermissionsStore, closePermissionsDialog } from '../../../store/permissions';
import { useWatchPermissions } from '../../../hooks/useWatchPermissions';
import { isSafari, isFireFox } from '../../../utils/livekit';
import { Settings, Close } from '@xipkg/icons';

/** Ссылки на официальные инструкции по выдаче прав в браузерах */
const BROWSER_HELP_LINKS = {
  chrome: 'https://support.google.com/chrome/answer/2693767',
  edge: 'https://support.microsoft.com/windows/windows-camera-microphone-and-privacy-a83257bc-e990-d54a-d212-b5e41beba857',
  firefox: 'https://support.mozilla.org/kb/how-manage-your-camera-and-microphone-permissions',
  safari: 'https://support.apple.com/guide/safari/ibrwe2159f50/mac',
} as const;

type BrowserKey = keyof typeof BROWSER_HELP_LINKS;

const BROWSER_INSTRUCTIONS: Record<
  BrowserKey,
  { title: string; steps: string[]; link: string; linkLabel: string }
> = {
  chrome: {
    title: 'Chrome и другие браузеры на базе Chromium (Edge, Brave и др.)',
    steps: [
      'Нажмите на значок замка или настроек слева от адресной строки.',
      'Найдите пункты «Камера» и «Микрофон».',
      'Выберите «Разрешить» для этого сайта и обновите страницу при необходимости.',
    ],
    link: BROWSER_HELP_LINKS.chrome,
    linkLabel: 'Инструкция Google Chrome',
  },
  edge: {
    title: 'Microsoft Edge',
    steps: [
      'Нажмите на значок замка или настроек слева от адресной строки.',
      'В разделе разрешений установите «Разрешить» для камеры и микрофона.',
      'При необходимости проверьте настройки Windows: Параметры → Конфиденциальность → Камера и Микрофон.',
    ],
    link: BROWSER_HELP_LINKS.edge,
    linkLabel: 'Камера и микрофон в Windows',
  },
  firefox: {
    title: 'Firefox',
    steps: [
      'Нажмите на иконку щита или замка слева от адресной строки.',
      'Откройте «Подробнее» → вкладка «Разрешения».',
      'Включите доступ для «Использовать камеру» и «Использовать микрофон».',
    ],
    link: BROWSER_HELP_LINKS.firefox,
    linkLabel: 'Инструкция Mozilla Firefox',
  },
  safari: {
    title: 'Safari',
    steps: [
      'Нажмите на иконку «aA» или названия сайта в адресной строке.',
      'Выберите «Настройки для этого веб-сайта».',
      'Для «Камера» и «Микрофон» выберите «Разрешить».',
    ],
    link: BROWSER_HELP_LINKS.safari,
    linkLabel: 'Настройки сайтов в Safari',
  },
};

/**
 * Модальное окно: объяснение прав на камеру и микрофон и инструкции по браузерам.
 * Singleton: useWatchPermissions выполняется один раз в приложении.
 */
export const PermissionsDialog = () => {
  useWatchPermissions();

  const isPermissionDialogOpen = usePermissionsStore((s) => s.isPermissionDialogOpen);

  const currentBrowser = useMemo((): BrowserKey => {
    if (isSafari()) return 'safari';
    if (isFireFox()) return 'firefox';
    return 'chrome'; // Chrome, Edge и остальные Chromium-based
  }, []);

  const instructions = useMemo(() => BROWSER_INSTRUCTIONS[currentBrowser], [currentBrowser]);

  if (!isPermissionDialogOpen) {
    return null;
  }

  return (
    <Modal open={isPermissionDialogOpen} onOpenChange={closePermissionsDialog}>
      <ModalContent>
        <ModalCloseButton>
          <Close className="fill-gray-80 sm:fill-gray-0" />
        </ModalCloseButton>
        <ModalHeader className="border-gray-20 border-b">
          <ModalTitle className="text-xl font-semibold text-gray-100">
            Доступ к камере и микрофону
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col gap-8 p-6">
          <section className="leading-relaxed">
            <p className="text-m-base text-gray-100">
              Для видеозвонков сайту нужен доступ к{' '}
              <strong className="font-semibold text-gray-100">камере</strong> и{' '}
              <strong className="font-semibold text-gray-100">микрофону</strong>: тогда другие
              участники смогут видеть и слышать вас. Разрешения запрашиваются только для работы
              звонка — камеру или микрофон можно отключить в любой момент в интерфейсе звонка.
            </p>
          </section>

          <section>
            <h3 className="text-m-base mb-1 font-semibold text-gray-100">Как выдать разрешение</h3>
            <p className="text-s-base text-gray-60 mb-4">{instructions.title}</p>
            <ol className="text-s-base list-decimal space-y-3 pl-5 text-gray-100">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 pl-1">
                  {index === 0 && currentBrowser === 'chrome' && (
                    <Settings className="text-gray-60 mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <a
              href={instructions.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-s-base text-brand-100 decoration-brand-100/50 hover:text-brand-80 hover:decoration-brand-80 mt-4 inline-flex items-center gap-1 font-medium underline underline-offset-2 transition-colors"
            >
              {instructions.linkLabel}
              <span aria-hidden>→</span>
            </a>
          </section>

          <section className="border-gray-10 bg-gray-5 rounded-xl border p-4">
            <p className="text-s-base mb-2 font-semibold text-gray-100">Другие браузеры</p>
            <p className="text-s-base text-gray-60 flex flex-wrap items-center gap-x-1 gap-y-1">
              <a
                href={BROWSER_HELP_LINKS.chrome}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-100 decoration-brand-100/50 hover:text-brand-80 underline underline-offset-2 transition-colors"
              >
                Chrome
              </a>
              <span className="text-gray-40" aria-hidden>
                ·
              </span>
              <a
                href={BROWSER_HELP_LINKS.edge}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-100 decoration-brand-100/50 hover:text-brand-80 underline underline-offset-2 transition-colors"
              >
                Edge / Windows
              </a>
              <span className="text-gray-40" aria-hidden>
                ·
              </span>
              <a
                href={BROWSER_HELP_LINKS.firefox}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-100 decoration-brand-100/50 hover:text-brand-80 underline underline-offset-2 transition-colors"
              >
                Firefox
              </a>
              <span className="text-gray-40" aria-hidden>
                ·
              </span>
              <a
                href={BROWSER_HELP_LINKS.safari}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-100 decoration-brand-100/50 hover:text-brand-80 underline underline-offset-2 transition-colors"
              >
                Safari
              </a>
            </p>
          </section>
        </div>

        <ModalFooter className="border-gray-20 flex border-t">
          <Button type="button" variant="secondary" onClick={closePermissionsDialog}>
            Закрыть
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

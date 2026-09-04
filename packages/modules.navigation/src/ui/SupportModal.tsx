import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalTitle, ModalBody } from '@xipkg/modal';
import { Button } from '@xipkg/button';
import {
  TelegramFilled,
  MailRounded,
  External,
  VK,
  Settings,
  ArrowLeft,
  Exit,
  Trash,
} from '@xipkg/icons';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'common.auth';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  inferActivationHelpScreen,
  trackProductEvent,
} from 'common.utils';
import { clearAppData } from './clearAppData';

const CONTACTS = [
  {
    titleKey: 'supportModal.telegram',
    descriptionKey: 'supportModal.telegramDesc',
    href: 'https://t.me/sovlium_support_bot',
    icon: TelegramFilled,
    colorClass: 'bg-status-info-background text-text-link',
    iconClass: 'fill-icon-brand',
    umamiEvent: 'support-telegram',
    channel: 'telegram' as const,
  },
  {
    titleKey: 'supportModal.vk',
    descriptionKey: 'supportModal.vkDesc',
    href: 'https://vk.com/im/convo/-230871378?entrypoint=community_page&tab=all',
    icon: VK,
    colorClass: 'bg-blue-100/10 text-blue-600',
    iconClass: 'text-blue-600',
    umamiEvent: 'support-vk',
    channel: 'vk' as const,
  },
  {
    titleKey: 'supportModal.email',
    descriptionKey: 'supportModal.emailDesc',
    href: 'mailto:support@sovlium.ru',
    icon: MailRounded,
    colorClass: 'bg-background-page text-text-primary',
    iconClass: 'fill-icon-primary',
    umamiEvent: 'support-email',
    channel: 'email' as const,
  },
] as const;

type SupportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ModalView = 'support' | 'devtools' | 'confirm-logout' | 'confirm-clear';

const headerIconButtonClass =
  'group flex size-6 shrink-0 items-center justify-center bg-transparent p-0';
const headerIconClass =
  'fill-icon-secondary group-hover:fill-icon-primary size-6 transition-colors';

export const SupportModal = ({ open, onOpenChange }: SupportModalProps) => {
  const { t } = useTranslation('navigation');
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ModalView>('support');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setView('support');
      setIsPending(false);
    }
  }, [open]);

  const trackSupportContact = (channel: 'telegram' | 'vk' | 'email') => {
    const screen = inferActivationHelpScreen();
    if (screen === 'signup' || screen === 'email_confirmation' || screen === 'onboarding') {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_SUPPORT_CONTACTED, {
        screen,
        reason: 'contact_support',
        channel,
      });
    }
  };

  const handleForceLogout = async () => {
    setIsPending(true);
    try {
      onOpenChange(false);
      await logout();
      await navigate({ to: '/signin', replace: true });
    } finally {
      setIsPending(false);
    }
  };

  const handleClearAppData = async () => {
    setIsPending(true);
    try {
      onOpenChange(false);
      await clearAppData();
    } finally {
      setIsPending(false);
    }
  };

  const title =
    view === 'devtools'
      ? t('supportModal.devtoolsTitle')
      : view === 'confirm-logout'
        ? t('supportModal.forceLogoutConfirmTitle')
        : view === 'confirm-clear'
          ? t('supportModal.clearDataConfirmTitle')
          : t('supportModal.title');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={modalContentClass} aria-describedby={undefined}>
        <ModalBody className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {view !== 'support' && (
                <button
                  type="button"
                  className={headerIconButtonClass}
                  onClick={() => setView(view === 'devtools' ? 'support' : 'devtools')}
                  aria-label={t('supportModal.devtoolsBack')}
                  disabled={isPending}
                >
                  <ArrowLeft className={headerIconClass} />
                </button>
              )}
              <ModalTitle className={modalTitleClass}>{title}</ModalTitle>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {view === 'support' && (
                <button
                  type="button"
                  className={headerIconButtonClass}
                  onClick={() => setView('devtools')}
                  aria-label={t('supportModal.devtoolsTitle')}
                  data-umami-event="support-devtools-open"
                >
                  <Settings className={headerIconClass} />
                </button>
              )}
              <ModalCloseIcon onClick={() => onOpenChange(false)} disabled={isPending} />
            </div>
          </div>

          {view === 'support' && (
            <>
              <p className={modalDescriptionClass}>{t('supportModal.description')}</p>

              {CONTACTS.map((contact) => (
                <a
                  key={contact.titleKey}
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event={contact.umamiEvent}
                  onClick={() => trackSupportContact(contact.channel)}
                  className="border-border-default hover:bg-background-page flex items-center gap-4 rounded-xl border p-4 transition-colors"
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${contact.colorClass}`}
                  >
                    <contact.icon className={`size-5 ${contact.iconClass}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-m-base text-text-primary font-medium">
                      {t(contact.titleKey)}
                    </div>
                    <div className="text-s-base text-text-secondary">
                      {t(contact.descriptionKey)}
                    </div>
                  </div>
                  <External className="text-text-disabled size-5 shrink-0" />
                </a>
              ))}

              <p className="text-text-disabled text-xs-base mt-2 text-center">
                {t('supportModal.responseTime')}
              </p>

              <div className="border-border-default mt-3 border-t pt-4">
                <p className="text-s-base text-text-secondary mb-3 text-center font-medium">
                  {t('supportModal.socials')}
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/sovlium"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-umami-event="support-social-telegram"
                    className="border-border-default hover:bg-background-page flex flex-1 items-center justify-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
                  >
                    <TelegramFilled className="fill-icon-secondary size-4 shrink-0" />
                    <span className="text-s-base text-text-primary">
                      {t('supportModal.socialTelegram')}
                    </span>
                  </a>
                  <a
                    href="https://vk.com/sovlium"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-umami-event="support-social-vk"
                    className="border-border-default hover:bg-background-page flex flex-1 items-center justify-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
                  >
                    <VK className="fill-icon-secondary size-4 shrink-0" />
                    <span className="text-s-base text-text-primary">
                      {t('supportModal.socialVk')}
                    </span>
                  </a>
                </div>
              </div>
            </>
          )}

          {view === 'devtools' && (
            <>
              <p className={modalDescriptionClass}>{t('supportModal.devtoolsDescription')}</p>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="m"
                  className="w-full gap-2"
                  onClick={() => setView('confirm-logout')}
                  data-umami-event="support-devtools-force-logout"
                >
                  <Exit className="fill-text-on-accent size-5 shrink-0" />
                  {t('supportModal.forceLogout')}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="m"
                  className="w-full gap-2"
                  onClick={() => setView('confirm-clear')}
                  data-umami-event="support-devtools-clear-data"
                >
                  <Trash className="fill-text-on-accent size-5 shrink-0" />
                  {t('supportModal.clearData')}
                </Button>
              </div>
            </>
          )}

          {view === 'confirm-logout' && (
            <>
              <p className={modalDescriptionClass}>
                {t('supportModal.forceLogoutConfirmDescription')}
              </p>
              <div className={modalFooterClass}>
                <Button
                  type="button"
                  variant="ghost"
                  size="m"
                  onClick={() => setView('devtools')}
                  disabled={isPending}
                >
                  {t('supportModal.devtoolsCancel')}
                </Button>
                <Button
                  type="button"
                  variant="error"
                  size="m"
                  onClick={handleForceLogout}
                  disabled={isPending}
                  loading={isPending}
                >
                  {t('supportModal.forceLogoutConfirmAction')}
                </Button>
              </div>
            </>
          )}

          {view === 'confirm-clear' && (
            <>
              <p className={modalDescriptionClass}>
                {t('supportModal.clearDataConfirmDescription')}
              </p>
              <div className={modalFooterClass}>
                <Button
                  type="button"
                  variant="ghost"
                  size="m"
                  onClick={() => setView('devtools')}
                  disabled={isPending}
                >
                  {t('supportModal.devtoolsCancel')}
                </Button>
                <Button
                  type="button"
                  variant="error"
                  size="m"
                  onClick={handleClearAppData}
                  disabled={isPending}
                  loading={isPending}
                >
                  {t('supportModal.clearDataConfirmAction')}
                </Button>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

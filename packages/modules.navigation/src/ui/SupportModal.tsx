import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
} from '@xipkg/modal';
import { TelegramFilled, MailRounded, External, VK } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { modalTitleClass } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  inferActivationHelpScreen,
  trackProductEvent,
} from 'common.utils';

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

export const SupportModal = ({ open, onOpenChange }: SupportModalProps) => {
  const { t } = useTranslation('navigation');

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

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[480px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle className={modalTitleClass}>{t('supportModal.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-3 pb-6">
          <p className="text-text-secondary text-s-base mb-1">{t('supportModal.description')}</p>

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
                <div className="text-s-base text-text-secondary">{t(contact.descriptionKey)}</div>
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
                <span className="text-s-base text-text-primary">{t('supportModal.socialVk')}</span>
              </a>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

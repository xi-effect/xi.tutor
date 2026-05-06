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

const CONTACTS = [
  {
    titleKey: 'supportModal.telegram',
    descriptionKey: 'supportModal.telegramDesc',
    href: 'https://t.me/sovlium_support_bot',
    icon: TelegramFilled,
    colorClass: 'bg-brand-0 text-brand-80',
    iconClass: 'fill-brand-80',
    umamiEvent: 'support-telegram',
  },
  {
    titleKey: 'supportModal.vk',
    descriptionKey: 'supportModal.vkDesc',
    href: 'https://vk.com/im/convo/-230871378?entrypoint=community_page&tab=all',
    icon: VK,
    colorClass: 'bg-blue-100/10 text-blue-600',
    iconClass: 'text-blue-600',
    umamiEvent: 'support-vk',
  },
  {
    titleKey: 'supportModal.email',
    descriptionKey: 'supportModal.emailDesc',
    href: 'mailto:support@sovlium.ru',
    icon: MailRounded,
    colorClass: 'bg-gray-5 text-gray-80',
    iconClass: 'fill-gray-80',
    umamiEvent: 'support-email',
  },
] as const;

type SupportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SupportModal = ({ open, onOpenChange }: SupportModalProps) => {
  const { t } = useTranslation('navigation');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-[480px]" aria-describedby={undefined}>
        <ModalHeader>
          <ModalCloseButton />
          <ModalTitle>{t('supportModal.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-3 pb-6">
          <p className="text-gray-60 text-s-base mb-1">{t('supportModal.description')}</p>

          {CONTACTS.map((contact) => (
            <a
              key={contact.titleKey}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event={contact.umamiEvent}
              className="border-gray-10 hover:bg-gray-5 flex items-center gap-4 rounded-xl border p-4 transition-colors"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${contact.colorClass}`}
              >
                <contact.icon className={`size-5 ${contact.iconClass}`} />
              </div>
              <div className="flex-1">
                <div className="text-m-base font-medium text-gray-100">{t(contact.titleKey)}</div>
                <div className="text-s-base text-gray-60">{t(contact.descriptionKey)}</div>
              </div>
              <External className="text-gray-30 size-5 shrink-0" />
            </a>
          ))}

          <p className="text-gray-40 text-xs-base mt-2 text-center">
            {t('supportModal.responseTime')}
          </p>

          <div className="border-gray-10 mt-3 border-t pt-4">
            <p className="text-s-base text-gray-60 mb-3 text-center font-medium">
              {t('supportModal.socials')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://t.me/sovlium"
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="support-social-telegram"
                className="border-gray-10 hover:bg-gray-5 flex flex-1 items-center justify-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
              >
                <TelegramFilled className="fill-gray-60 size-4 shrink-0" />
                <span className="text-s-base text-gray-80">{t('supportModal.socialTelegram')}</span>
              </a>
              <a
                href="https://vk.com/sovlium"
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="support-social-vk"
                className="border-gray-10 hover:bg-gray-5 flex flex-1 items-center justify-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
              >
                <VK className="fill-gray-60 size-4 shrink-0" />
                <span className="text-s-base text-gray-80">{t('supportModal.socialVk')}</span>
              </a>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

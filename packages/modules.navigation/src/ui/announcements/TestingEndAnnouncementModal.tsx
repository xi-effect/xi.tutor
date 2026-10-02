import { Button } from '@xipkg/button';
import { External } from '@xipkg/icons';
import { Modal, ModalBody, ModalContent, ModalTitle } from '@xipkg/modal';
import { useTranslation } from 'react-i18next';
import {
  ModalCloseIcon,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
} from 'common.ui';
const TESTING_END_ARTICLE_URL = 'https://sovlium.ru/blog/sovlium-zavershenie-testirovaniya-2026';

type TestingEndAnnouncementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissForever: () => void;
};

export const TestingEndAnnouncementModal = ({
  open,
  onOpenChange,
  onDismissForever,
}: TestingEndAnnouncementModalProps) => {
  const { t } = useTranslation('navigation');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={`${modalContentClass} max-w-[760px]`} aria-describedby={undefined}>
        <ModalBody className="flex min-w-0 flex-col gap-5 overflow-hidden p-5 sm:p-8">
          <div className={modalHeaderRowClass}>
            <ModalTitle className="font-playfair text-text-primary m-0 min-w-0 flex-1 text-xl leading-snug font-medium wrap-break-word sm:text-2xl sm:leading-normal">
              {t('testingEnd.title')}
            </ModalTitle>
            <ModalCloseIcon onClick={() => onOpenChange(false)} aria-label={t('close')} />
          </div>

          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-m-base text-text-secondary sm:text-l-base m-0 min-w-0 leading-5 text-pretty wrap-break-word sm:leading-6">
                {t('testingEnd.lead')}
              </p>
              <p className="text-m-base text-text-secondary sm:text-l-base m-0 min-w-0 leading-5 text-pretty wrap-break-word sm:leading-6">
                {t('testingEnd.details')}
              </p>
            </div>
            <img
              src="/stickers/21.webp"
              alt=""
              className="pointer-events-none hidden size-36 shrink-0 object-contain sm:block"
            />
          </div>

          <div
            className={`${modalFooterClass} w-full flex-col items-stretch sm:w-auto sm:flex-row sm:items-start`}
          >
            <Button
              type="button"
              variant="ghost"
              size="m"
              className={`${modalCancelButtonClass} w-full justify-center sm:w-auto`}
              onClick={onDismissForever}
            >
              {t('testingEnd.dismiss')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className={`${modalConfirmButtonClass} w-full justify-center gap-2 sm:w-auto`}
              onClick={() => {
                window.open(TESTING_END_ARTICLE_URL, '_blank', 'noopener,noreferrer');
              }}
            >
              {t('testingEnd.read')}
              <External className="fill-text-on-accent size-4 shrink-0" />
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

import { Button } from '@xipkg/button';
import { External } from '@xipkg/icons';
import { Modal, ModalBody, ModalContent, ModalTitle } from '@xipkg/modal';
import { useTranslation } from 'react-i18next';
import {
  ModalCloseIcon,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
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
        <ModalBody className="flex min-w-0 flex-col gap-5 overflow-hidden p-8">
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{t('testingEnd.title')}</ModalTitle>
            <ModalCloseIcon onClick={() => onOpenChange(false)} aria-label={t('close')} />
          </div>

          <div className="flex min-w-0 items-center gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className={`${modalDescriptionClass} text-pretty`}>{t('testingEnd.lead')}</p>
              <p className={`${modalDescriptionClass} text-pretty`}>{t('testingEnd.details')}</p>
            </div>
            <img
              src="/stickers/21.webp"
              alt=""
              className="pointer-events-none size-28 shrink-0 object-contain sm:size-36"
            />
          </div>

          <div className={`${modalFooterClass} flex-wrap`}>
            <Button
              type="button"
              variant="ghost"
              size="m"
              className={modalCancelButtonClass}
              onClick={onDismissForever}
            >
              {t('testingEnd.dismiss')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="m"
              className={`${modalConfirmButtonClass} gap-2`}
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

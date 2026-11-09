import { Modal, ModalBody, ModalContent, ModalTitle } from '@xipkg/modal';
import { useTranslation } from 'react-i18next';
import { ModalCloseIcon, modalContentClass, modalHeaderRowClass } from 'common.ui';

type SubscriptionReleaseNoteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
};

export const SubscriptionReleaseNoteModal = ({
  open,
  onOpenChange,
  title,
  children,
}: SubscriptionReleaseNoteModalProps) => {
  const { t } = useTranslation('navigation');

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className={`${modalContentClass} max-w-[760px]`} aria-describedby={undefined}>
        <ModalBody className="flex min-w-0 flex-col gap-5 overflow-hidden p-5 sm:p-8">
          <div className={modalHeaderRowClass}>
            {title ? (
              <ModalTitle className="font-playfair text-text-primary m-0 min-w-0 flex-1 text-xl leading-snug font-medium wrap-break-word sm:text-2xl sm:leading-normal">
                {title}
              </ModalTitle>
            ) : (
              <ModalTitle className="sr-only">{t('close')}</ModalTitle>
            )}
            <ModalCloseIcon onClick={() => onOpenChange(false)} aria-label={t('close')} />
          </div>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

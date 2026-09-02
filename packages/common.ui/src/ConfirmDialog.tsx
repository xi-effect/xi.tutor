import { type ReactNode, useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { ModalCloseIcon } from './ModalCloseIcon';
import {
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from './modalChrome';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  confirmVariant?: 'error' | 'primary';
};

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Отменить',
  onConfirm,
  isPending = false,
  confirmVariant = 'error',
}: ConfirmDialogProps) => {
  useEffect(() => cleanupBodyScrollLock, []);

  const handleConfirm = () => {
    onOpenChange(false);
    cleanupBodyScrollLock();
    onConfirm();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={modalContentClass}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
      >
        <ModalBody className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{title}</ModalTitle>
            <ModalCloseIcon onClick={() => onOpenChange(false)} disabled={isPending} />
          </div>

          <ModalDescription className={`${modalDescriptionClass} line-clamp-3`}>
            {description}
          </ModalDescription>

          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              size="m"
              className={modalConfirmButtonClass}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {confirmLabel}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

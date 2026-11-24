import { type ReactNode, useEffect, useRef, useState } from 'react';
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
  for (const className of [...document.body.classList]) {
    if (className.startsWith('block-interactivity-')) {
      document.body.classList.remove(className);
    }
  }
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
  const wasOpenRef = useRef(false);
  const onConfirmRef = useRef(onConfirm);
  const [portalKey, setPortalKey] = useState(0);
  onConfirmRef.current = onConfirm;

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (!wasOpenRef.current) return;

    // Radix снимает слой после клика и может вернуть pointer-events: none,
    // если меню уже заблокировало body до открытия этой модалки.
    const unlockSoon = window.setTimeout(cleanupBodyScrollLock, 0);
    const unlockAfterExit = window.setTimeout(cleanupBodyScrollLock, 300);
    return () => {
      window.clearTimeout(unlockSoon);
      window.clearTimeout(unlockAfterExit);
    };
  }, [open]);

  useEffect(() => cleanupBodyScrollLock, []);

  const handleConfirm = () => {
    onOpenChange(false);
    // Новый ключ сразу размонтирует портал. Иначе выходная анимация зависает,
    // когда очистка доски перерисовывает страницу, и невидимый оверлей ловит клики.
    setPortalKey((key) => key + 1);
    window.setTimeout(() => {
      cleanupBodyScrollLock();
      onConfirmRef.current();
      window.requestAnimationFrame(cleanupBodyScrollLock);
    }, 0);
  };

  return (
    <Modal key={portalKey} open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={modalContentClass}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
      >
        <ModalBody className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass} title={title}>
              {title}
            </ModalTitle>
            <ModalCloseIcon onClick={() => onOpenChange(false)} disabled={isPending} />
          </div>

          <ModalDescription className={modalDescriptionClass}>{description}</ModalDescription>

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

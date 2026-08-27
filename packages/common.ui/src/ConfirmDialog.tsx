import { type ReactNode, useEffect } from 'react';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';

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
        className="bg-background-surface w-full max-w-[480px] rounded-3xl shadow-[0px_24px_32px_0px_rgba(16,16,16,0.08),0px_16px_16px_0px_rgba(16,16,16,0.08)]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
      >
        <ModalBody className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between gap-4 overflow-hidden">
            <ModalTitle className="font-playfair text-text-primary m-0 flex-1 text-2xl leading-normal font-medium">
              {title}
            </ModalTitle>
            <button
              type="button"
              className="group flex size-6 shrink-0 items-center justify-center bg-transparent p-0"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              aria-label="Close"
            >
              <Close className="fill-icon-secondary group-hover:fill-icon-primary size-6 transition-colors" />
            </button>
          </div>

          <ModalDescription className="text-m-base text-text-secondary m-0 line-clamp-3 leading-5">
            {description}
          </ModalDescription>

          <div className="flex items-start justify-end gap-3 overflow-hidden pt-3">
            <Button
              type="button"
              variant="none"
              size="m"
              className="bg-background-page text-text-secondary hover:bg-background-subtle hover:text-text-secondary focus:bg-background-subtle focus:text-text-secondary active:bg-background-subtle active:text-text-secondary h-auto rounded-xl px-5 py-2.5 font-medium"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              size="m"
              className="h-auto rounded-xl px-5 py-2.5 font-medium"
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

import { type ReactNode } from 'react';
import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';

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
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="bg-background-surface w-full max-w-[480px] rounded-3xl shadow-[0px_24px_32px_0px_rgba(16,16,16,0.08),0px_16px_16px_0px_rgba(16,16,16,0.08)]">
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
              <Close className="fill-gray-60 group-hover:fill-gray-80 size-6 transition-colors" />
            </button>
          </div>

          <ModalDescription className="text-m-base text-text-primary m-0 line-clamp-3 leading-5">
            {description}
          </ModalDescription>

          <div className="flex items-start justify-end gap-3 overflow-hidden pt-3">
            <Button
              type="button"
              variant="none"
              size="m"
              className="bg-gray-5 text-text-secondary hover:bg-gray-10 hover:text-text-secondary focus:bg-gray-10 focus:text-text-secondary active:bg-gray-10 active:text-text-secondary h-auto rounded-xl px-5 py-2.5 font-medium"
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
              onClick={onConfirm}
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

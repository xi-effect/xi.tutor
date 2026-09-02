import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import type { LibraryFile } from 'common.api';
import { MAX_FILENAME_LENGTH, useRenameLibraryFile } from 'common.services';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { toast } from 'sonner';
import { getLibraryFileNameParts } from '../../utils';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

const stripTrailingExtension = (value: string, extension: string): string => {
  if (!extension) {
    return value;
  }

  const suffix = `.${extension}`;
  if (value.toLowerCase().endsWith(suffix.toLowerCase())) {
    return value.slice(0, -suffix.length).trim();
  }

  return value;
};

type RenameFileModalProps = {
  file: LibraryFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const RenameFileModal = ({ file, open, onOpenChange }: RenameFileModalProps) => {
  const { t } = useTranslation('materials');
  const inputId = useId();
  const renameMutation = useRenameLibraryFile();
  const { name: originalName, extension } = useMemo(() => getLibraryFileNameParts(file), [file]);
  const [name, setName] = useState(originalName);

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(getLibraryFileNameParts(file).name);
  }, [file, open]);

  const trimmedName = stripTrailingExtension(name.trim(), extension);
  const isTooLong = name.length > MAX_FILENAME_LENGTH;
  const isEmpty = trimmedName.length === 0;
  const isUnchanged = trimmedName === originalName;
  const canSave = !isEmpty && !isTooLong && !isUnchanged && !renameMutation.isPending;

  const handleClose = () => {
    if (renameMutation.isPending) {
      return;
    }

    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    renameMutation.mutate(
      {
        fileId: file.id,
        name: trimmedName,
      },
      {
        onSuccess: () => {
          toast.success(t('files.rename.success'));
          onOpenChange(false);
          cleanupBodyScrollLock();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next && renameMutation.isPending) {
          return;
        }

        onOpenChange(next);
      }}
    >
      <ModalContent
        className={modalContentClass}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
      >
        <form
          className={modalBodyClass}
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{t('files.rename.title')}</ModalTitle>
            <ModalCloseIcon onClick={handleClose} disabled={renameMutation.isPending} />
          </div>

          <div className="flex flex-col">
            <label className="sr-only" htmlFor={inputId}>
              {t('files.rename.title')}
            </label>
            <Input
              id={inputId}
              variant="m"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              value={name}
              error={isTooLong}
              disabled={renameMutation.isPending}
              onChange={(event) => setName(event.target.value)}
              after={
                extension ? (
                  <span className="text-text-secondary pointer-events-none text-base leading-5">
                    .{extension}
                  </span>
                ) : undefined
              }
              afterClassName="pointer-events-none"
              className={cn(extension && 'pr-16')}
            />
            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-text-danger min-h-4 text-xs leading-4">
                {isTooLong ? t('files.rename.tooLong', { max: MAX_FILENAME_LENGTH }) : null}
              </p>
              <p className="text-text-secondary shrink-0 text-xs leading-4">
                {t('files.rename.counter', { current: name.length, max: MAX_FILENAME_LENGTH })}
              </p>
            </div>
          </div>

          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={handleClose}
              disabled={renameMutation.isPending}
              data-umami-event="materials-file-rename-cancel"
            >
              {t('files.rename.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="m"
              className={modalConfirmButtonClass}
              disabled={!canSave}
              data-umami-event="materials-file-rename-save"
            >
              {renameMutation.isPending ? t('files.rename.saving') : t('files.rename.save')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

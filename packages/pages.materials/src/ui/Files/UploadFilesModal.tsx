import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Check, Close, File, Image, Music, Plus, Presentation, Upload } from '@xipkg/icons';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import type { FileKind } from 'common.api';
import {
  ModalCloseIcon,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { toast } from 'sonner';
import { LIBRARY_UPLOAD_MAX_FILES } from './libraryUpload';
import { useSimulatedLibraryUploads, type LibraryUploadItem } from './useSimulatedLibraryUploads';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

const kindIcon: Record<FileKind, typeof File> = {
  image: Image,
  audio: Music,
  document: File,
  presentation: Presentation,
  uncategorized: File,
};

type UploadFilesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const collectDroppedFiles = (event: DragEvent<HTMLElement>): File[] =>
  Array.from(event.dataTransfer.files ?? []);

export const UploadFilesModal = ({ open, onOpenChange }: UploadFilesModalProps) => {
  const { t } = useTranslation('materials');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { items, addFiles, removeItem, cancelAll } = useSimulatedLibraryUploads(open);

  const doneCount = items.filter((item) => item.status === 'done').length;
  const canAddMore = items.length < LIBRARY_UPLOAD_MAX_FILES;

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (open) {
      return;
    }

    setIsDragging(false);
  }, [open]);

  const handleClose = () => {
    cancelAll();
    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  const applyAddResult = (result: ReturnType<typeof addFiles>) => {
    if (result.rejectedLimit > 0) {
      toast.error(t('files.uploadModal.maxFiles', { max: LIBRARY_UPLOAD_MAX_FILES }));
    }

    result.rejectedTooLarge.forEach((name) => {
      toast.error(t('files.uploadModal.tooLarge', { name }));
    });

    result.rejectedTooLong.forEach((name) => {
      toast.error(t('files.uploadModal.tooLong', { name }));
    });
  };

  const handleFiles = (fileList: File[]) => {
    if (!fileList.length) {
      return;
    }

    applyAddResult(addFiles(fileList));
  };

  const openPicker = () => {
    if (!canAddMore) {
      toast.error(t('files.uploadModal.maxFiles', { max: LIBRARY_UPLOAD_MAX_FILES }));
      return;
    }

    inputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(collectDroppedFiles(event));
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          handleClose();
          return;
        }

        onOpenChange(next);
      }}
    >
      <ModalContent
        className={cn(modalContentClass, 'flex max-w-135 flex-col overflow-hidden')}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          cleanupBodyScrollLock();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-6 p-6">
          <div className={modalHeaderRowClass}>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <ModalTitle className={modalTitleClass}>{t('files.uploadModal.title')}</ModalTitle>
              <ModalDescription className={modalDescriptionClass}>
                {items.length > 0
                  ? t('files.uploadModal.progress', { done: doneCount, total: items.length })
                  : t('files.uploadModal.description')}
              </ModalDescription>
            </div>
            <ModalCloseIcon onClick={handleClose} aria-label={t('files.uploadModal.close')} />
          </div>

          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              handleFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />

          {items.length === 0 ? (
            <div
              onClick={openPicker}
              className={cn(
                'flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors',
                isDragging
                  ? 'border-border-focus bg-status-info-background'
                  : 'border-border-default bg-transparent',
              )}
            >
              <div className="bg-background-subtle flex size-16 items-center justify-center rounded-full">
                <Upload className="fill-icon-secondary size-8" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-text-primary text-sm leading-5 font-medium">
                  {t('files.uploadModal.dropTitle')}
                </p>
                <p className="text-text-secondary text-sm leading-5">
                  {t('files.uploadModal.dropSubtitle')}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="m"
                className="h-12 rounded-xl px-6 font-medium"
                onClick={(event) => {
                  event.stopPropagation();
                  openPicker();
                }}
                data-umami-event="materials-files-upload-select"
              >
                {t('files.uploadModal.select')}
              </Button>
            </div>
          ) : (
            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
              {items.map((item) => (
                <UploadFileRow key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>
          )}

          {items.length > 0 ? (
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="primary"
                size="m"
                className={cn(modalConfirmButtonClass, 'h-12 w-full')}
                onClick={openPicker}
                disabled={!canAddMore}
                data-umami-event="materials-files-upload-add"
              >
                <Plus className="fill-action-primary-text size-6 shrink-0" />
                {t('files.uploadModal.add')}
              </Button>
              <Button
                type="button"
                variant="none"
                size="m"
                className={cn(modalCancelButtonClass, 'h-12 w-full')}
                onClick={cancelAll}
                data-umami-event="materials-files-upload-cancel"
              >
                {t('files.uploadModal.cancel')}
              </Button>
            </div>
          ) : null}

          {items.length === 0 ? (
            <p className="text-text-secondary w-full text-center text-xs leading-4">
              {t('files.uploadModal.limitsEmpty')}
            </p>
          ) : (
            <div className="flex w-full flex-col items-center gap-1">
              <p className="text-text-secondary w-full text-center text-xs leading-4">
                {t('files.uploadModal.limitsCount', { max: LIBRARY_UPLOAD_MAX_FILES })}
              </p>
              <p className="text-text-muted text-xxs-base-size w-full text-center leading-4">
                {t('files.uploadModal.limitsSize')}
              </p>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

type UploadFileRowProps = {
  item: LibraryUploadItem;
  onRemove: (id: string) => void;
};

const UploadFileRow = ({ item, onRemove }: UploadFileRowProps) => {
  const { t } = useTranslation('materials');
  const Icon = kindIcon[item.kind] ?? File;
  const isDone = item.status === 'done';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg p-3',
        isDone ? 'bg-status-success-background' : 'bg-background-subtle',
      )}
    >
      <Icon
        className={cn('size-6 shrink-0', isDone ? 'fill-status-success-text' : 'fill-icon-primary')}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-text-primary line-clamp-1 min-w-0 flex-1 text-xs leading-4 font-medium">
            {item.file.name}
          </p>
          <p
            className={cn(
              'shrink-0 text-xs leading-4',
              isDone ? 'text-status-success-text font-medium' : 'text-text-secondary font-normal',
            )}
          >
            {isDone ? t('files.uploadModal.done') : `${item.progress}%`}
          </p>
        </div>
        {isDone ? null : (
          <div className="bg-border-default dark:bg-background-page h-1.5 w-full overflow-hidden rounded-[3px]">
            <div
              className="bg-action-primary-background-default h-full rounded-[3px] transition-[width] duration-150"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
      {isDone ? (
        <div className="flex p-1">
          <Check className="fill-status-success-text size-4 shrink-0" />
        </div>
      ) : (
        <button
          type="button"
          className="bg-background-page hover:bg-background-elevated flex rounded-md p-1"
          onClick={() => onRemove(item.id)}
          aria-label={t('files.uploadModal.remove')}
        >
          <Close className="fill-icon-secondary size-4" />
        </button>
      )}
    </div>
  );
};

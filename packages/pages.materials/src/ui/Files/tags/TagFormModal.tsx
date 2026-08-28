import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import type { LibraryTag } from './libraryTagsStore';
import { useLibraryTags } from './useLibraryTags';
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
import {
  DEFAULT_TAG_COLOR,
  LIBRARY_TAG_COLORS,
  MAX_TAG_NAME_LENGTH,
  type LibraryTagColorId,
} from './tagColors';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

type TagFormModalProps = {
  open: boolean;
  tag?: LibraryTag | null;
  onOpenChange: (open: boolean) => void;
};

export const TagFormModal = ({ open, tag, onOpenChange }: TagFormModalProps) => {
  const { t } = useTranslation('materials');
  const nameId = useId();
  const colorGroupId = useId();
  const { tags, createTag, updateTag } = useLibraryTags();
  const isEdit = Boolean(tag);
  const [name, setName] = useState('');
  const [color, setColor] = useState<LibraryTagColorId>(DEFAULT_TAG_COLOR);

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(tag?.name ?? '');
    setColor(tag?.color ?? DEFAULT_TAG_COLOR);
  }, [open, tag]);

  const trimmedName = name.trim();
  const isTooLong = name.length > MAX_TAG_NAME_LENGTH;
  const isEmpty = trimmedName.length === 0;
  const isDuplicate = useMemo(
    () =>
      tags.some(
        (item) =>
          item.id !== tag?.id && item.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      ),
    [tag?.id, tags, trimmedName],
  );
  const isUnchanged = isEdit && trimmedName === tag?.name && color === tag?.color;
  const canSubmit = !isEmpty && !isTooLong && !isDuplicate && !isUnchanged;

  const handleClose = () => {
    onOpenChange(false);
    cleanupBodyScrollLock();
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    if (tag) {
      updateTag(tag.id, { name: trimmedName, color });
    } else {
      createTag(trimmedName, color);
    }

    handleClose();
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
            handleSubmit();
          }}
        >
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>
              {isEdit ? t('files.tagForm.editTitle') : t('files.tagForm.createTitle')}
            </ModalTitle>
            <ModalCloseIcon onClick={handleClose} aria-label={t('files.tagForm.close')} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-text-secondary text-xs leading-4" htmlFor={nameId}>
              {t('files.tagForm.name')}
            </label>
            <Input
              id={nameId}
              variant="m"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              value={name}
              error={isTooLong || isDuplicate}
              onChange={(event) => setName(event.target.value)}
            />
            <p className="text-text-danger min-h-4 text-xs leading-4">
              {isTooLong
                ? t('files.tagForm.tooLong', { max: MAX_TAG_NAME_LENGTH })
                : isDuplicate
                  ? t('files.tagForm.duplicate')
                  : null}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-text-secondary text-xs leading-4" id={colorGroupId}>
              {t('files.tagForm.color')}
            </p>
            <div
              role="radiogroup"
              aria-labelledby={colorGroupId}
              className="flex flex-wrap items-center gap-3"
            >
              {LIBRARY_TAG_COLORS.map((option) => {
                const selected = color === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={option.id}
                    className={cn(
                      'flex size-8 cursor-pointer items-center justify-center rounded-full outline-offset-2',
                      selected && `outline-2 outline-solid ${option.ring}`,
                    )}
                    onClick={() => setColor(option.id)}
                    data-umami-event="materials-tag-color"
                    data-umami-event-color={option.id}
                  >
                    <span className={cn('size-6 rounded-full', option.dot)} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={handleClose}
              data-umami-event="materials-tag-form-cancel"
            >
              {t('files.tagForm.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="m"
              className={modalConfirmButtonClass}
              disabled={!canSubmit}
              data-umami-event={isEdit ? 'materials-tag-form-save' : 'materials-tag-form-create'}
            >
              {isEdit ? t('files.tagForm.save') : t('files.tagForm.create')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Textarea } from '@xipkg/textarea';
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
import { MAX_HOMEWORK_DESCRIPTION_LENGTH, MAX_HOMEWORK_TITLE_LENGTH } from '../types';
import type { HomeworkKind } from '../types';
import { cleanupBodyScrollLock } from './modalLock';

type HomeworkFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  kind?: HomeworkKind;
  initialTitle?: string;
  initialDescription?: string;
  onClose: () => void;
  onSubmit: (value: { title: string; description: string }) => void;
};

export const HomeworkFormModal = ({
  open,
  mode,
  kind = 'assignment',
  initialTitle = '',
  initialDescription = '',
  onClose,
  onSubmit,
}: HomeworkFormModalProps) => {
  const { t } = useTranslation('homework');
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [open, initialTitle, initialDescription]);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const isTitleTooLong = title.length > MAX_HOMEWORK_TITLE_LENGTH;
  const isDescriptionTooLong = description.length > MAX_HOMEWORK_DESCRIPTION_LENGTH;
  const isEmpty = trimmedTitle.length === 0;
  const isUnchanged =
    mode === 'edit' &&
    trimmedTitle === initialTitle.trim() &&
    trimmedDescription === initialDescription.trim();
  const canSubmit = !isEmpty && !isTitleTooLong && !isDescriptionTooLong && !isUnchanged;

  const handleClose = () => {
    onClose();
    cleanupBodyScrollLock();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: trimmedTitle, description: trimmedDescription });
    cleanupBodyScrollLock();
  };

  const modalTitle =
    mode === 'create'
      ? t('form.createTitle')
      : t(kind === 'template' ? 'form.editTemplateTitle' : 'form.editTitle');

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
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
            <ModalTitle className={modalTitleClass}>{modalTitle}</ModalTitle>
            <ModalCloseIcon onClick={handleClose} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-s-base text-text-primary mb-2 font-medium" htmlFor={titleId}>
                {t('form.name')}
              </label>
              <Input
                id={titleId}
                variant="m"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                value={title}
                error={isTitleTooLong}
                onChange={(event) => setTitle(event.target.value)}
              />
              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="text-text-danger min-h-4 text-xs leading-4">
                  {isTitleTooLong ? t('form.tooLong', { max: MAX_HOMEWORK_TITLE_LENGTH }) : null}
                </p>
                <p className="text-text-secondary shrink-0 text-xs leading-4">
                  {t('form.counter', { current: title.length, max: MAX_HOMEWORK_TITLE_LENGTH })}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <label
                className="text-s-base text-text-primary mb-2 font-medium"
                htmlFor={descriptionId}
              >
                {t('form.description')}
              </label>
              <Textarea
                id={descriptionId}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                maxLength={MAX_HOMEWORK_DESCRIPTION_LENGTH}
                maxRows={5}
                hideCounter
                className="border-border-default placeholder:text-text-disabled text-text-primary min-h-[88px] resize-y rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={handleClose}
              data-umami-event="homework-form-cancel"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="m"
              className={modalConfirmButtonClass}
              disabled={!canSubmit}
              data-umami-event={mode === 'create' ? 'homework-create' : 'homework-edit-save'}
            >
              {mode === 'create' ? t('form.create') : t('form.save')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

import { useEffect, useId, useState } from 'react';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { MAX_FILENAME_LENGTH } from 'common.services';
import { ModalEditMaterialNamePropsT } from 'common.types';
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
import { useTranslation } from 'react-i18next';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

export const ModalEditMaterialName = ({
  isClassroom,
  isOpen,
  name,
  content_kind,
  isLoading = false,
  onClose,
  handleUpdateName,
}: ModalEditMaterialNamePropsT) => {
  const { t } = useTranslation('materialsEdit');
  const inputId = useId();
  const originalName = name?.trim() ?? '';
  const [value, setValue] = useState(originalName);

  useEffect(() => cleanupBodyScrollLock, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValue(name?.trim() ?? '');
  }, [isOpen, name]);

  const trimmedName = value.trim();
  const isTooLong = value.length > MAX_FILENAME_LENGTH;
  const isEmpty = trimmedName.length === 0;
  const isUnchanged = trimmedName === originalName;
  const canSave = !isEmpty && !isTooLong && !isUnchanged && !isLoading;

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    onClose();
    cleanupBodyScrollLock();
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    handleUpdateName(isClassroom ? 'classroom' : 'personal', trimmedName, () => {
      onClose();
      cleanupBodyScrollLock();
    });
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && isLoading) {
          return;
        }

        if (!next) {
          handleClose();
        }
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
            <ModalTitle className={modalTitleClass}>
              {content_kind === 'note' ? t('titleNote') : t('titleBoard')}
            </ModalTitle>
            <ModalCloseIcon onClick={handleClose} disabled={isLoading} />
          </div>

          <div className="flex flex-col">
            <label className="sr-only" htmlFor={inputId}>
              {content_kind === 'note' ? t('titleNote') : t('titleBoard')}
            </label>
            <Input
              id={inputId}
              variant="m"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              value={value}
              error={isTooLong}
              disabled={isLoading}
              onChange={(event) => setValue(event.target.value)}
            />
            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-text-danger min-h-4 text-xs leading-4">
                {isTooLong ? t('tooLong', { max: MAX_FILENAME_LENGTH }) : null}
              </p>
              <p className="text-text-secondary shrink-0 text-xs leading-4">
                {t('counter', { current: value.length, max: MAX_FILENAME_LENGTH })}
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
              disabled={isLoading}
              data-umami-event="material-edit-cancel"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="m"
              className={modalConfirmButtonClass}
              disabled={!canSave}
              data-umami-event="material-edit-save"
              data-umami-event-type={content_kind}
            >
              {isLoading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

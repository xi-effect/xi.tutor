import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import {
  ModalCloseIcon,
  cardAccessBadgeClass,
  modalBodyClass,
  modalCancelButtonClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalFooterClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { useHomeworkPresentation } from '../hooks/useHomeworkPresentation';
import { homeworkStatusBadgeClass } from '../status';
import type { HomeworkItem } from '../types';
import { cleanupBodyScrollLock } from './modalLock';

type HomeworkDetailsModalProps = {
  item: HomeworkItem;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
};

export const HomeworkDetailsModal = ({
  item,
  open,
  onClose,
  onEdit,
}: HomeworkDetailsModalProps) => {
  const { t } = useTranslation('homework');
  const { status, description, primaryLine, dateLine } = useHomeworkPresentation(item);

  useEffect(() => cleanupBodyScrollLock, []);

  const handleClose = () => {
    onClose();
    cleanupBodyScrollLock();
  };

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
        <div className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>{item.title}</ModalTitle>
            <ModalCloseIcon onClick={handleClose} />
          </div>

          {status ? (
            <Badge
              variant="default"
              className={cn('w-fit', cardAccessBadgeClass, homeworkStatusBadgeClass[status])}
            >
              {t(`status.${status}`)}
            </Badge>
          ) : null}

          {description ? (
            <p className="text-m-base text-text-secondary m-0 leading-5 break-words">
              {description}
            </p>
          ) : null}

          <div className="flex flex-col gap-1">
            <p className="text-s-base text-text-primary m-0 leading-5">{primaryLine}</p>
            <p className="text-s-base text-text-secondary m-0 leading-5">{dateLine}</p>
          </div>

          {item.students.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-s-base text-text-primary m-0 font-medium">
                {t('details.students')}
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {item.students.map((student) => (
                  <li key={student.id} className="flex items-center justify-between gap-3">
                    <span className="text-s-base text-text-primary truncate">{student.name}</span>
                    <span className="text-text-secondary shrink-0 text-xs leading-4">
                      {t(`studentState.${student.state}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={modalFooterClass}>
            <Button
              type="button"
              variant="none"
              size="m"
              className={modalCancelButtonClass}
              onClick={handleClose}
            >
              {t('details.close')}
            </Button>
            {onEdit ? (
              <Button
                type="button"
                variant="primary"
                size="m"
                className={modalConfirmButtonClass}
                onClick={onEdit}
                data-umami-event="homework-details-edit"
              >
                {t('details.edit')}
              </Button>
            ) : null}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

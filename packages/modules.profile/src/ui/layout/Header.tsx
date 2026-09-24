import { Dispatch, type ReactNode, SetStateAction } from 'react';
import { ArrowLeft } from '@xipkg/icons';
import { ModalTitle } from '@xipkg/modal';
import { cn, useMediaQuery } from '@xipkg/utils';
import {
  ModalCloseIcon,
  modalCloseButtonClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';

type HeaderPropsT = {
  settingsTitle: string;
  sectionTitle: string;
  action?: ReactNode;
  showContent: boolean;
  setShowContent: Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
};

const HeaderActions = ({
  action,
  handleClose,
  closeLabel,
}: {
  action?: ReactNode;
  handleClose: () => void;
  closeLabel: string;
}) => (
  <div className="flex shrink-0 items-center gap-3">
    {action}
    <ModalCloseIcon onClick={handleClose} aria-label={closeLabel} />
  </div>
);

export const Header = ({
  settingsTitle,
  sectionTitle,
  action,
  showContent,
  setShowContent,
  handleClose,
}: HeaderPropsT) => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');
  const showBack = isMobile && showContent;
  const closeLabel = t('menu.close');

  if (isMobile) {
    return (
      <div className={modalHeaderRowClass}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={() => setShowContent(false)}
              className={modalCloseButtonClass}
              aria-label={t('menu.back')}
            >
              <ArrowLeft className="fill-icon-secondary group-hover:fill-icon-primary size-6" />
            </button>
          ) : null}
          <ModalTitle className={modalTitleClass}>
            {showBack ? sectionTitle : settingsTitle}
          </ModalTitle>
        </div>
        <HeaderActions
          action={showBack ? action : undefined}
          handleClose={handleClose}
          closeLabel={closeLabel}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8 overflow-hidden">
      <ModalTitle className={cn(modalTitleClass, 'w-[220px] flex-none shrink-0 pl-2')}>
        {settingsTitle}
      </ModalTitle>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden">
        <p className={cn(modalTitleClass, 'min-w-0')}>{sectionTitle}</p>
        <HeaderActions action={action} handleClose={handleClose} closeLabel={closeLabel} />
      </div>
    </div>
  );
};

import { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, Close } from '@xipkg/icons';
import { ModalCloseButton } from '@xipkg/modal';
import { cn, useMediaQuery } from '@xipkg/utils';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';

const menuLabels = [
  'Личные данные',
  ...(THEME_CUSTOMIZATION_ENABLED ? ['Персонализация'] : []),
  'Безопасность',
  'Уведомления',
  'Эффекты',
  'Отчёт',
];

type HeaderPropsT = {
  activeItem: number | 'menu';
  showContent: boolean;
  setShowContent: Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
};

export const Header = ({ activeItem, showContent, setShowContent, handleClose }: HeaderPropsT) => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <div className="relative flex h-[40px] w-full items-center justify-start">
      {isMobile && showContent && (
        <button
          type="button"
          onClick={() => setShowContent(false)}
          className="h-10 w-10 bg-transparent p-2"
        >
          <ArrowLeft />
        </button>
      )}
      {isMobile && showContent && (
        <span className="ml-4 font-semibold">{menuLabels[Number(activeItem)]}</span>
      )}
      <ModalCloseButton
        onClick={() => handleClose()}
        variant="full"
        className={cn(
          'bg-gray-5 top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full px-0 pt-0 sm:right-0',
        )}
      >
        <Close className="fill-gray-80 h-5 w-5" />
      </ModalCloseButton>
    </div>
  );
};

import { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, Close } from '@xipkg/icons';
import { ModalCloseButton } from '@xipkg/modal';
import { useMediaQuery } from '@xipkg/utils';

const menuLabels = [
  'Личные данные',
  // 'Персонализация',
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

  const closeButtonClassName = isMobile
    ? 'top-0 right-0 flex items-center justify-center !p-0 !pt-0'
    : 'top-6 right-6';

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
        variant="none"
        className={closeButtonClassName}
      >
        <Close className="" />
      </ModalCloseButton>
    </div>
  );
};

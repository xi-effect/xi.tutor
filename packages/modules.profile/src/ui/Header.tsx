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

  return (
    <div className="xs:h-0 relative flex h-[40px] w-full items-center justify-start">
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
        className="xs:top-0 xs:right-0"
      >
        <Close className="" />
      </ModalCloseButton>
    </div>
  );
};

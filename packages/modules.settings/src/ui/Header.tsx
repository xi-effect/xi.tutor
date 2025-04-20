import { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, Close } from '@xipkg/icons';
import { ModalCloseButton } from '@xipkg/modal';
import { useMediaQuery } from '@xipkg/utils';

const menuLabels = ['Главная', 'Личные данные', 'Безопасность'];

type HeaderPropsT = {
  activeItem: number | 'menu';
  showContent: boolean;
  setShowContent: Dispatch<SetStateAction<boolean>>;
  handleClose: () => void;
};

export const Header = ({ activeItem, showContent, setShowContent, handleClose }: HeaderPropsT) => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <div className="relative flex h-[40px] w-full items-center justify-start sm:mt-4">
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
        className="static right-[16px] ml-auto flex h-10 w-10 bg-transparent p-2 sm:absolute sm:top-0 sm:right-0 sm:bg-transparent xl:top-0 xl:right-[-56px]"
      >
        <Close />
      </ModalCloseButton>
    </div>
  );
};

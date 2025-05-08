import { ReactNode } from 'react';

type ActionButtonPropsT = {
  icon: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  withBorder?: boolean;
};

export const ActionButton = ({
  icon,
  onClick,
  isActive = false,
  withBorder = true,
}: ActionButtonPropsT) => {
  return (
    <button
      type="button"
      className={` ${isActive ? 'bg-brand-80' : 'bg-transparent'} ${withBorder ? 'border-gray-80 border' : ''} flex h-10 w-10 items-center justify-center rounded-full transition-colors`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

import { cn } from '@xipkg/utils';
import { buttonVariants } from '@xipkg/button';
import { ReactNode } from 'react';

interface BubbleButtonProps {
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}

export const BubbleButton = ({ isActive, onClick, ariaLabel, children }: BubbleButtonProps) => {
  const buttonClass = cn(
    buttonVariants({ variant: 'ghost' }),
    'h-9 w-9 p-0 flex items-center justify-center',
    'text-gray-100 hover:text-gray-100',
    'dark:text-gray-100 dark:hover:text-gray-100',
    isActive
      ? 'bg-brand-40 text-gray-0 hover:bg-brand-60 dark:bg-brand-20 dark:text-gray-100 dark:hover:bg-brand-40'
      : 'hover:bg-brand-20 dark:hover:bg-primary',
  );

  return (
    <button onClick={onClick} className={buttonClass} aria-label={ariaLabel}>
      {children}
    </button>
  );
};

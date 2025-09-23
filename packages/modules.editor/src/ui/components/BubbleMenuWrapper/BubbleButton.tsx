import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { ReactNode } from 'react';

interface BubbleButtonProps {
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}

export const BubbleButton = ({ isActive, onClick, ariaLabel, children }: BubbleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(`${isActive && 'bg-brand-0 [&_svg]:fill-brand-100'} h-6 w-6 rounded-[2px] p-1`)}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
};

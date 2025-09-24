import { cn } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import { ReactNode } from 'react';
import { useTextFormat, useYjsContext } from '../../../hooks';
import { TextFormatTypeT } from '../../../types';

interface BubbleButtonProps {
  type: TextFormatTypeT;
  ariaLabel: string;
  children: ReactNode;
  isActive: boolean;
}

export const BubbleButton = ({ ariaLabel, type, isActive, children }: BubbleButtonProps) => {
  const { editor } = useYjsContext();
  const { toggleFormat } = useTextFormat(editor, type);

  return (
    <Button
      onClick={toggleFormat}
      variant="ghost"
      className={cn(`${isActive && 'bg-brand-0 [&_svg]:fill-brand-100'} h-6 w-6 rounded-[2px] p-1`)}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
};

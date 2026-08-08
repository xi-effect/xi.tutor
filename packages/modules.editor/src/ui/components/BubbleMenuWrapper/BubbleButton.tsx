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
      variant="none"
      className={cn(
        '[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1',
        isActive && 'bg-status-info-background [&_svg]:fill-icon-brand',
      )}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
};

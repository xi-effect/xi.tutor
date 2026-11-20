import { type ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import { TooltipContent } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';

type CardTooltipContentProps = ComponentProps<typeof TooltipContent>;

/**
 * Подсказка карточки в сетке со скроллом.
 * Контент тултипа из @xipkg/tooltip остаётся внутри карточки, и overflow списка его обрезает.
 */
export const CardTooltipContent = ({ className, ...props }: CardTooltipContentProps) => {
  const content = (
    <TooltipContent
      className={cn('z-[200] max-w-64 text-left leading-5 font-normal wrap-break-word', className)}
      {...props}
    />
  );

  if (typeof document === 'undefined') return content;

  return createPortal(content, document.body);
};

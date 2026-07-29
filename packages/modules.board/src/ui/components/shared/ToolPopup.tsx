/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { boardDropdownZClass } from '../../boardTheme';

type ToolPopupProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  content: React.ReactNode;
  isCloseOnOutside?: boolean;
};

export const ToolPopup = ({
  children,
  open,
  onOpenChange,
  content,
  isCloseOnOutside = false,
}: ToolPopupProps) => {
  const handleEvent = (e: any) => {
    if (!isCloseOnOutside && e.target.classList.contains('dr-container')) {
      e.preventDefault();
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>{children}</PopoverPrimitive.Anchor>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={12}
        onPointerDownOutside={handleEvent}
        onInteractOutside={handleEvent}
        onEscapeKeyDown={handleEvent}
        className={cn(
          boardDropdownZClass,
          'w-auto max-w-[calc(100vw-2rem)] border-none bg-transparent p-0 shadow-none',
        )}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';

type ToolPopupProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  content: React.ReactNode;
};

export const ToolPopup = ({ children, open, onOpenChange, content }: ToolPopupProps) => {
  const handleEvent = (e: any) => {
    if (e.target.classList.contains('tl-container')) {
      e.preventDefault();
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className="pointer-events-auto flex gap-2">
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          align="center"
          side="top"
          sideOffset={12}
          onPointerDownOutside={handleEvent}
          onInteractOutside={handleEvent}
          onEscapeKeyDown={handleEvent}
          className="w-full border-none bg-transparent p-0 shadow-none"
        >
          {content}
        </PopoverContent>
      </div>
    </Popover>
  );
};

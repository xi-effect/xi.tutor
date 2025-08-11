/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { OpacitySizeMenu } from './OpacitySizeMenu';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const PenPopup = ({ children, open, onOpenChange }: StylePopupContentT) => {
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
          className="border-gray-10 bg-gray-0 flex h-full w-full rounded-xl border p-0 shadow-none md:w-[562px]"
        >
          <OpacitySizeMenu />
        </PopoverContent>
      </div>
    </Popover>
  );
};

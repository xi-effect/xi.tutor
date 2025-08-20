/* eslint-disable @typescript-eslint/no-explicit-any */
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { PopupItemT } from '../../../../utils/navBarElements';
import { ColorSet } from './ColorSet';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupItems?: PopupItemT[];
};

export const StickerPopup = ({ children, open, onOpenChange, popupItems }: StylePopupContentT) => {
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
          className="border-gray-10 bg-gray-0 flex w-full gap-2 rounded-xl border p-1 shadow-none"
        >
          <ColorSet popupItems={popupItems} />
        </PopoverContent>
      </div>
    </Popover>
  );
};

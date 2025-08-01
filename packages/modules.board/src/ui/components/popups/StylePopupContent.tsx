import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { StyleMenu } from './StyleMenu';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const StylePopupContent = ({ children, open, onOpenChange }: StylePopupContentT) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className="pointer-events-auto flex gap-2">
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          align="center"
          side="top"
          sideOffset={12}
          className="border-gray-10 bg-gray-0 flex h-full w-full rounded-xl border p-0 shadow-none md:w-[562px]"
        >
          <StyleMenu />
        </PopoverContent>
      </div>
    </Popover>
  );
};

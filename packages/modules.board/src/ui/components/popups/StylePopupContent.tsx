import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { StyleMenu } from './StyleMenu';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';
import { useTldrawStore } from '../../../store/useTldrawStore';
import { useEffect } from 'react';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const StylePopupContent = ({ children, open, onOpenChange }: StylePopupContentT) => {
  const { setColor, setThickness, setOpacity, resetToDefaults } = useTldrawStyles();
  const { pencilColor, pencilThickness, pencilOpacity } = useTldrawStore();

  // При открытии попапа применяем сохраненные настройки
  useEffect(() => {
    if (open) {
      setColor(pencilColor);
      setThickness(pencilThickness);
      setOpacity(pencilOpacity);
    }
  }, [open, pencilColor, pencilThickness, pencilOpacity, setColor, setThickness, setOpacity]);

  // При закрытии попапа сбрасываем к дефолтным настройкам
  useEffect(() => {
    if (!open) {
      resetToDefaults();
    }
  }, [open, resetToDefaults]);

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

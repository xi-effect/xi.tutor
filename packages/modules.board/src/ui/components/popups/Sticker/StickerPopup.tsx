import { ColorSet } from './ColorSet';
import { ToolPopup } from '../../shared';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const StickerPopup = ({ children, open, onOpenChange }: StylePopupContentT) => {
  return (
    <ToolPopup open={open} onOpenChange={onOpenChange} content={<ColorSet />}>
      {children}
    </ToolPopup>
  );
};

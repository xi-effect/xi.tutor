import { PopupItemT } from '../../../../utils/navBarElements';
import { ColorSet } from './ColorSet';
import { ToolPopup } from '../../shared';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupItems?: PopupItemT[];
};

export const StickerPopup = ({ children, open, onOpenChange, popupItems }: StylePopupContentT) => {
  return (
    <ToolPopup
      open={open}
      onOpenChange={onOpenChange}
      content={<ColorSet popupItems={popupItems} />}
    >
      {children}
    </ToolPopup>
  );
};

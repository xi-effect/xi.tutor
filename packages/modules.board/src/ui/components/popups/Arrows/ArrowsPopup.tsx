import { ToolPopup } from '../../shared';
import { ArrowSet } from './ArrowSet';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ArrowsPopup = ({ children, open, onOpenChange }: StylePopupContentT) => {
  return (
    <ToolPopup open={open} onOpenChange={onOpenChange} content={<ArrowSet />}>
      {children}
    </ToolPopup>
  );
};

import { OpacitySizeMenu } from './OpacitySizeMenu';
import { ToolPopup } from '../../shared';

type StylePopupContentT = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const PenPopup = ({ children, open, onOpenChange }: StylePopupContentT) => {
  return (
    <ToolPopup open={open} onOpenChange={onOpenChange} content={<OpacitySizeMenu />}>
      {children}
    </ToolPopup>
  );
};

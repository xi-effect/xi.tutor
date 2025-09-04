import { ShapeSet } from './ShapeSet';
import { ToolPopup } from '../../shared';

export const ShapesPopup = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <ToolPopup open={open} onOpenChange={onOpenChange} content={<ShapeSet />}>
      {children}
    </ToolPopup>
  );
};

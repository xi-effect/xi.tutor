import { Button } from '@xipkg/button';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { boardSelectionToolbarButtonClass } from '../../../boardTheme';
import { BoardDrawer, useBoardIsMobile } from '../../shared';

type TPicker = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerTitle: string;
  triggerChild: React.ReactNode;
  popoverChild?: React.ReactNode;
};

export const Picker: React.FC<TPicker> = ({
  open,
  setOpen,
  triggerChild,
  popoverChild,
  triggerTitle,
}) => {
  const isMobile = useBoardIsMobile();

  const trigger = (
    <Button
      variant="none"
      size="s"
      className={boardSelectionToolbarButtonClass}
      title={triggerTitle}
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      {triggerChild}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <BoardDrawer open={open} onOpenChange={setOpen} title={triggerTitle}>
          <div className="px-1 py-2">{popoverChild}</div>
        </BoardDrawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-border-default bg-background-surface w-auto rounded-xl border p-3 shadow-md"
      >
        {popoverChild}
      </PopoverContent>
    </Popover>
  );
};

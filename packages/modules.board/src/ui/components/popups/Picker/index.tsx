import { Button } from '@xipkg/button';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';

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
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="none" size="s" className="hover:bg-brand-0 p-1" title={triggerTitle}>
          {triggerChild}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 w-auto rounded-xl border p-3 shadow-md"
      >
        {popoverChild}
      </PopoverContent>
    </Popover>
  );
};

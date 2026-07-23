import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { NavbarButton } from '../../ui/components/shared';
import { Link } from '@xipkg/icons';
import { Input } from '@xipkg/input';

type LinkNavbarButtonT = {
  open: boolean;
  setOpen: (value: boolean) => void;
  link: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  isActive: boolean;
};

export const LinkNavbarButton = ({
  open,
  setOpen,
  link,
  onChange,
  onKeyDown,
  onClick,
  isActive,
}: LinkNavbarButtonT) => (
  <Popover open={open}>
    <PopoverTrigger asChild>
      <NavbarButton
        icon={<Link />}
        title="Ссылка"
        isActive={isActive}
        onClick={onClick}
        className="data-[state=open]:bg-brand-0"
      />
    </PopoverTrigger>
    <PopoverContent side="top" sideOffset={8} asChild>
      <div onClick={() => setOpen(false)}>
        <div className="fixed mt-[-100vh] ml-[-100vw] h-[200vh] w-[200vw] bg-transparent"></div>
        <Input
          variant="s"
          placeholder="Введите ссылку и нажмите 'Enter'"
          value={link}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="z-1000"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </PopoverContent>
  </Popover>
);

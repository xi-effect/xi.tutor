import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { useEditor } from 'tldraw';

export const MoreActionsMenu = () => {
  const editor = useEditor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" size="s" className="hover:bg-brand-0 p-1">
          <MenuDots className="rotate-90" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 fle w-[180px] flex-col gap-2 rounded-xl border p-1"
      >
        <DropdownMenuItem
          onClick={() => {
            const selectedIds = editor.getSelectedShapeIds();
            editor.toggleLock(selectedIds);
          }}
          className="rounded-lg px-3"
        >
          Заблокировать
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

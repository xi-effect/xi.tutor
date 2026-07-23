import { useState } from 'react';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { TemplateT } from 'common.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { ModalTemplate } from './ModalTemplate';

export const TemplateCard = ({
  name,
  price,
  id,
  handleDeleteTemplate,
}: TemplateT & {
  handleDeleteTemplate: (id: number) => () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEditTemplate = () => {
    setMenuOpen(false);
    setModalOpen(true);
  };

  return (
    <div className="hover:bg-background-page border-border-control bg-background-surface flex cursor-pointer justify-between rounded-2xl border p-4">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="text-l-base text-text-primary flex-1 truncate">{name}</div>

        <div className="mt-auto flex flex-row items-center gap-1">
          <span className="text-l-base text-text-primary truncate font-semibold">{price}</span>
          <span className="text-s-base text-text-secondary pt-1">₽</span>
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="none" size="icon">
              <MoreVert className="fill-icon-primary h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-border-default bg-background-surface border p-1"
          >
            <DropdownMenuItem
              className="text-text-primary hover:text-text-primary focus:text-text-primary"
              onClick={handleEditTemplate}
            >
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-text-primary hover:text-text-primary focus:text-text-primary"
              onClick={handleDeleteTemplate(id)}
            >
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ModalTemplate
        isOpen={modalOpen}
        type="edit"
        name={name}
        price={price}
        id={id}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

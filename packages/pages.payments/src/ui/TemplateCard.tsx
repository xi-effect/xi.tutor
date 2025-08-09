import { useState } from 'react';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { TemplateT } from 'common.types';
// import { useEditTemplate } from 'common.services';
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

  // const { mutate: editTemplateMutation } = useEditTemplate();
  // const handleSubmitTemplate = () => {

  // };

  return (
    <div className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4">
      <div className="flex max-w-[350px] flex-col gap-4">
        <div>{name}</div>

        <div className="mt-auto flex items-center gap-2">{price}</div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="ghost" size="icon">
              <MoreVert className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 bg-gray-0 border p-1"
          >
            <DropdownMenuItem onClick={handleEditTemplate}>Редактировать</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteTemplate(id)}>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ModalTemplate isOpen={modalOpen} type="edit" onClose={() => setModalOpen(false)} />
    </div>
  );
};

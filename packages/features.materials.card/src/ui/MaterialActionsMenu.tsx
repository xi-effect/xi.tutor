import { AccessModeT } from 'common.types';
import { useState } from 'react';
import { DropdownButton } from './DropdownButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';

export const MaterialActionsMenu: React.FC<{
  isClassroom: boolean;
  isTutor: boolean;
  studentAccessMode?: AccessModeT;
  onDelete: () => void;
  onDeleteFromClassroom: () => void;
  onUpdateAccessMode: (mode: AccessModeT) => void;
  onDuplicate: () => void;
}> = ({
  isClassroom,
  isTutor,
  studentAccessMode,
  onDelete,
  onDeleteFromClassroom,
  onUpdateAccessMode,
  onDuplicate,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    action();
  };

  if (isClassroom && isTutor) {
    return (
      <DropdownButton
        studentAccessMode={studentAccessMode ?? ''}
        onDelete={onDeleteFromClassroom}
        onUpdateAccessMode={onUpdateAccessMode}
      />
    );
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="h-6 w-6" variant="ghost" size="icon">
          <MoreVert className="h-4 w-4 dark:fill-gray-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="border-gray-10 bg-gray-0 border p-1"
      >
        <DropdownMenuItem onClick={handleAction(onDuplicate)}>
          Дублировать в кабинет
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAction(onDelete)}>Удалить</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

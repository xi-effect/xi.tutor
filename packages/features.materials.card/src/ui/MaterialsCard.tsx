import { useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

import { Button } from '@xipkg/button';
import { LongAnswer, MoreVert, WhiteBoard } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { AccessModeT, MaterialPropsT } from '../types';
import { formatToShortDate } from '../utils';
import {
  useCurrentUser,
  useDeleteClassroomMaterials,
  useDeleteMaterials,
  useUpdateClassroomMaterial,
} from 'common.services';
import { cn } from '@xipkg/utils';
import { DropdownButton } from './DropdownButton';
import { Badge } from '@xipkg/badge';

const accessMap: Record<AccessModeT, string> = {
  read_write: 'совместная работа',
  read_only: 'только репетитор',
  no_access: 'черновик',
};

const mapStyles: Record<AccessModeT, string> = {
  read_write: 'bg-gray-10 text-gray-60',
  read_only: 'bg-cyan-20 text-cyan-100',
  no_access: 'bg-violet-20 text-violet-100',
};

const iconClassName = 'size-6 fill-gray-100';

const mapIcon: Record<'note' | 'board', React.ReactNode> = {
  note: <LongAnswer className={iconClassName} aria-label="note" />,
  board: <WhiteBoard className={iconClassName} aria-label="board" />,
};

export const MaterialsCard: React.FC<MaterialPropsT> = ({
  id,
  updated_at,
  name,
  content_kind,
  student_access_mode,
  onOpenModal,
}) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { deleteMaterials } = useDeleteMaterials();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  // Хук для удаления материалов
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();

  // Хук для обновления материалов
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    deleteMaterials.mutate({
      id: id.toString(),
      content_kind: content_kind as 'note' | 'board',
      name,
    });
  };

  const { classroomId } = useParams({ strict: false });

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);
    onOpenModal(id);
  };

  const handleDeleteMaterial = () => {
    if (classroomId) {
      deleteClassroomMaterials.mutate({
        classroomId: classroomId || '',
        id: id.toString(),
        content_kind: content_kind as 'note' | 'board',
        name: name,
      });
    }
  };

  // Обработчик обновления режима доступа
  const handleUpdateAccessMode = (newAccessMode: AccessModeT) => {
    if (classroomId && newAccessMode !== student_access_mode) {
      updateClassroomMaterial.mutate({
        classroomId: classroomId || '',
        id: id.toString(),
        data: {
          student_access_mode: newAccessMode,
        },
      });
    }
  };

  return (
    <div
      onClick={() => {
        // Сохраняем только параметр call при переходе
        const filteredSearch = search.call ? { call: search.call } : {};

        navigate({
          to: `/materials/${id}/${content_kind}`,
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            ...filteredSearch,
          }),
        });
      }}
      className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4"
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex h-full flex-col justify-between gap-4">
          {student_access_mode && accessMap[student_access_mode] && (
            <Badge
              variant="default"
              className={cn('text-s-base px-2 py-1 font-medium', mapStyles[student_access_mode])}
            >
              {accessMap[student_access_mode]}
            </Badge>
          )}

          <div className="text-l-base line-clamp-2 flex w-full items-center gap-2 font-medium text-gray-100">
            {mapIcon[content_kind]}
            <p className="truncate">{name}</p>
          </div>
          <div className="text-s-base text-gray-60 font-normal">
            Обновлено: {formatToShortDate(updated_at)}
          </div>
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
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
            <DropdownMenuItem onClick={handleDuplicate}>Дублировать в кабинет</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isTutor && (
          <DropdownButton
            studentAccessMode={student_access_mode ?? ''}
            onDelete={handleDeleteMaterial}
            onUpdateAccessMode={handleUpdateAccessMode}
          />
        )}
      </div>
    </div>
  );
};

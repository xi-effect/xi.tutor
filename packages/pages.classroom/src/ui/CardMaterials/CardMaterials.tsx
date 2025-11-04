import { Badge } from '@xipkg/badge';
import { formatToShortDate } from 'pages.materials';
import { cn } from '@xipkg/utils';
import { LongAnswer, WhiteBoard } from '@xipkg/icons';

import { DropdownButton } from './DropdownButton';
import { AccessModeT, ClassroomMaterialsT } from 'common.types';
import {
  useCurrentUser,
  useDeleteClassroomMaterials,
  useUpdateClassroomMaterial,
} from 'common.services';
import { useParams } from '@tanstack/react-router';

export type CardMaterialsProps = {
  material: ClassroomMaterialsT;
  showIcon?: boolean;
  onClick?: () => void;
};

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

export const CardMaterials = ({ material, showIcon = true, onClick }: CardMaterialsProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { classroomId } = useParams({ strict: false });
  const { id, name, content_kind, updated_at, student_access_mode } = material;

  // Хук для удаления материалов
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();

  // Хук для обновления материалов
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();

  // Обработчик удаления материала
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

  if (!material) {
    return null;
  }

  return (
    <div
      role="group"
      className="border-gray-30 bg-gray-0 hover:bg-gray-5 flex min-h-[96px] w-[350px] max-w-[350px] cursor-pointer flex-col items-start justify-start gap-2 rounded-2xl border p-4"
      onClick={onClick}
    >
      <div className="flex w-full flex-row items-center justify-between">
        {student_access_mode && accessMap[student_access_mode] && (
          <Badge
            variant="default"
            className={cn('text-s-base px-2 py-1 font-medium', mapStyles[student_access_mode])}
          >
            {accessMap[student_access_mode]}
          </Badge>
        )}

        {isTutor && (
          <DropdownButton
            studentAccessMode={student_access_mode ?? ''}
            onDelete={handleDeleteMaterial}
            onUpdateAccessMode={handleUpdateAccessMode}
          />
        )}
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4">
        <div className="flex w-full min-w-0 items-center gap-2">
          {showIcon && content_kind && mapIcon[content_kind]}
          <div className="text-l-base min-w-0 flex-1 overflow-hidden font-medium text-ellipsis whitespace-nowrap text-gray-100">
            {name}
          </div>
        </div>

        <div className="flex flex-row items-center justify-start gap-2">
          <span className="text-s-base text-gray-60 font-normal">
            Изменено: {updated_at ? formatToShortDate(updated_at) : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

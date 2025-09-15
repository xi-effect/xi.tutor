import { useState } from 'react';
import { Edit } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { cn } from '@xipkg/utils';
import { EditDescriptionModal } from '../modals/EditDescriptionModal';
import { Button } from '@xipkg/button';

interface EditableDescriptionProps {
  description: string | null;
  classroomId: number;
  className?: string;
}

export const EditableDescription = ({
  description,
  classroomId,
  className,
}: EditableDescriptionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: user } = useCurrentUser();

  // Проверяем, является ли пользователь репетитором
  const isTutor = user?.default_layout === 'tutor';

  const handleEditClick = () => {
    if (!isTutor) return; // Только репетитор может редактировать
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={cn('group relative flex items-center gap-2', className)}>
        <div className="text-m-base text-gray-60 font-medium">
          {description || 'Описание не указано'}
        </div>

        {isTutor && (
          <Button
            variant="ghost"
            size="s"
            onClick={handleEditClick}
            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            title="Редактировать описание"
          >
            <Edit className="fill-gray-60 h-4 w-4" />
          </Button>
        )}
      </div>

      <EditDescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        description={description}
        classroomId={classroomId}
      />
    </>
  );
};

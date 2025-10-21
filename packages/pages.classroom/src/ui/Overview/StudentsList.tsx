import { UserProfile } from '@xipkg/userprofile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { ModalStudentsGroup, useDeleteStudentFromGroup } from 'features.group.manage';
import { ErrorState } from './ErrorState';
import { GroupStudentsListSchema } from 'common.types';
import { useGroupStudentsList } from 'common.services';
import { OverviewSkeleton } from './OverviewSkeleton';
import { toast } from 'sonner';
import { ContactsBadge } from '../Header/components/ContactsBadge';

type StudentsListPropsT = {
  classroomId: string;
};

export const StudentsList = ({ classroomId }: StudentsListPropsT) => {
  const { data: students, isLoading, isError, refetch } = useGroupStudentsList(classroomId);
  const deleteStudentMutation = useDeleteStudentFromGroup({ classroom_id: classroomId });

  if (isLoading) {
    return <OverviewSkeleton numberOfSections={1} />;
  }

  if (isError || !students) {
    return <ErrorState message="Не удалось загрузить список учеников" onRetry={refetch} />;
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-5">
        <h2 className="text-lg font-semibold text-gray-100">Добавьте ученика в группу</h2>
        <ModalStudentsGroup>
          <Button size="m" variant="secondary">
            Добавить ученика
          </Button>
        </ModalStudentsGroup>
      </div>
    );
  }

  const handleDeleteStudent = async (userId: number) => {
    try {
      await deleteStudentMutation.mutateAsync(userId);
      toast.success('Студент удален из группы');
    } catch {
      toast.error('Не удалось удалить студента');
    }
  };

  return (
    <div className="flex flex-row gap-8 pb-4">
      {students.map(({ user_id, display_name }: GroupStudentsListSchema) => (
        <div
          className="border-gray-60 relative flex min-h-30 min-w-[350px] items-center justify-between rounded-2xl border p-4"
          key={user_id}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <UserProfile
                userId={user_id}
                withOutText
                src={`https://api.sovlium.ru/files/users/${user_id}/avatar.webp`}
                size="l"
              />
              <h3 className="text-m-base font-medium text-gray-100">{display_name}</h3>
            </div>
            <ContactsBadge userId={user_id} />
          </div>
          <div className="absolute top-4 right-4 flex h-8 w-8 rounded-full bg-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8" variant="ghost" size="icon">
                  <MoreVert className="h-4 w-4 dark:fill-gray-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                className="border-gray-10 bg-gray-0 border p-1"
              >
                <DropdownMenuItem
                  onClick={() => {
                    handleDeleteStudent(user_id);
                  }}
                >
                  Удалить из группы
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

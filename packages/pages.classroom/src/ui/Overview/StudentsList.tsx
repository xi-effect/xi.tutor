import { UserProfile } from '@xipkg/userprofile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { useDeleteStudentFromGroup } from 'features.group.manage';
import { ErrorState } from './ErrorState';
import { GroupStudentsListSchema } from 'common.types';

type StudentsListPropsT = {
  students: GroupStudentsListSchema[] | undefined;
  classroomId: string;
  isError: boolean;
  onRetry?: () => void;
};

export const StudentsList = ({ students, classroomId, isError, onRetry }: StudentsListPropsT) => {
  const deleteStudentMutation = useDeleteStudentFromGroup({ classroom_id: classroomId });

  if (isError || !students) {
    return <ErrorState message="Не удалось загрузить список учеников" onRetry={onRetry} />;
  }

  if (students.length === 0) {
    return <h2 className="font-medium text-gray-900">В группе нет учеников</h2>;
  }

  return (
    <div className="flex flex-row gap-8">
      {students.map(({ user_id, display_name }) => (
        <div
          className="border-gray-60 flex min-h-20 min-w-[350px] items-center justify-between rounded-2xl border p-4"
          key={user_id}
        >
          <div className="flex items-center gap-2">
            <UserProfile
              userId={user_id}
              withOutText
              src={`https://api.sovlium.ru/files/users/${user_id}/avatar.webp`}
              size="l"
            />
            <h3 className="text-m-base font-medium text-gray-100">{display_name}</h3>
          </div>
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-4 w-4" variant="ghost" size="icon">
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
                    deleteStudentMutation.mutateAsync(user_id);
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

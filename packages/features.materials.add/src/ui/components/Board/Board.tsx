import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom, Plus } from '@xipkg/icons';
import { useAddMaterials, useAddClassroomMaterials } from 'common.services';
import { useParams, useNavigate } from '@tanstack/react-router';

interface BoardProps {
  onCreate?: () => void;
  onlyDrafts?: boolean;
  classroomId?: string;
}

type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

export const Board = ({ onlyDrafts = false, onCreate, classroomId }: BoardProps) => {
  const { classroomId: paramsClassroomId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { addMaterials } = useAddMaterials();
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const currentClassroomId = classroomId || paramsClassroomId;

  const handleCreateBoardDraft = () => {
    if (onCreate) {
      onCreate();
    } else {
      addMaterials.mutate(
        { content_kind: 'board' },
        {
          onSuccess: (response) => {
            navigate({
              to: `/materials/${response.data.id}/${response.data.content_kind}`,
            });
          },
        },
      );
    }
  };

  const handleCreateBoardWithAccess = (studentAccessMode: StudentAccessMode) => {
    if (currentClassroomId) {
      addClassroomMaterials.mutate(
        {
          classroomId: currentClassroomId,
          content_kind: 'board',
          student_access_mode: studentAccessMode,
        },
        {
          onSuccess: (response) => {
            navigate({
              to: '/classrooms/$classroomId/boards/$boardId',
              params: { classroomId: currentClassroomId, boardId: response.data.id },
            });
          },
        },
      );
    }
  };

  if (onlyDrafts) {
    return (
      <Button
        onClick={handleCreateBoardDraft}
        variant="primary"
        className="!h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium max-sm:hidden"
        disabled={addMaterials.isPending}
        data-umami-event="material-create-board-draft"
      >
        <Plus className="fill-text-on-accent size-4 shrink-0" />
        {addMaterials.isPending ? 'Создание...' : 'Создать доску'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="bg-background-surface group text-s-base hover:text-text-on-accent hover:bg-action-primary-background-default data-[state=open]:text-text-on-accent data-[state=open]:bg-action-primary-background-default border-border-control text-text-primary hover:border-border-control flex h-8 w-[160px] flex-row items-center justify-between gap-[6px] rounded-lg border px-4 font-medium transition-colors duration-200 max-[550px]:hidden"
        data-umami-event="material-create-board-menu-open"
      >
        <span>Создать доску</span>
        <ChevronSmallBottom className="group-hover:fill-action-primary-text group-data-[state=open]:fill-action-primary-text fill-icon-primary h-[16px] w-[16px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border-border-default text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('read_write')}
          className="hover:bg-status-info-background hover:text-text-link py-6 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="read_write"
        >
          Совместная работа
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('read_only')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="read_only"
        >
          Только репетитор
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('no_access')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="no_access"
        >
          Черновики
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

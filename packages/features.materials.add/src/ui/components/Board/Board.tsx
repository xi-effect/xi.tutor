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
import { useTranslation } from 'react-i18next';

interface BoardProps {
  onCreate?: () => void;
  onlyDrafts?: boolean;
  classroomId?: string;
}

type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

export const Board = ({ onlyDrafts = false, onCreate, classroomId }: BoardProps) => {
  const { t } = useTranslation('materialsAdd');
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
        {addMaterials.isPending ? t('board.creating') : t('board.create')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group bg-background-subtle text-text-primary data-[state=open]:bg-background-surface hover:bg-background-surface flex !h-auto w-auto flex-row items-center justify-between gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium transition-colors duration-200 max-sm:hidden"
        data-umami-event="material-create-board-menu-open"
      >
        <span>{t('board.create')}</span>
        <ChevronSmallBottom className="fill-icon-secondary group-data-[state=open]:fill-icon-primary h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border-border-default text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('read_write')}
          className="hover:bg-status-info-background hover:text-text-link py-6 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="read_write"
        >
          {t('board.collaborative')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('read_only')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="read_only"
        >
          {t('board.tutorOnly')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleCreateBoardWithAccess('no_access')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-board"
          data-umami-event-access-mode="no_access"
        >
          {t('board.drafts')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

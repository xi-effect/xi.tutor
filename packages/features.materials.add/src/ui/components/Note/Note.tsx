import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';
import { useAddMaterials, useAddClassroomMaterials } from 'common.services';
import { useParams, useNavigate } from '@tanstack/react-router';

interface NoteProps {
  onlyDrafts?: boolean;
  onCreate?: () => void;
  classroomId?: string;
}

type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

export const Note = ({ onlyDrafts = false, onCreate, classroomId }: NoteProps) => {
  const { classroomId: paramsClassroomId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { addMaterials } = useAddMaterials();
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const currentClassroomId = classroomId || paramsClassroomId;

  const handleCreateNoteDraft = () => {
    if (onCreate) {
      onCreate();
    } else {
      addMaterials.mutate(
        { content_kind: 'note' },
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

  const handleCreateNoteWithAccess = (studentAccessMode: StudentAccessMode) => {
    if (currentClassroomId) {
      addClassroomMaterials.mutate(
        {
          classroomId: currentClassroomId,
          content_kind: 'note',
          student_access_mode: studentAccessMode,
        },
        {
          onSuccess: (response) => {
            navigate({
              to: '/classrooms/$classroomId/notes/$noteId',
              params: { classroomId: currentClassroomId, noteId: response.data.id },
            });
          },
        },
      );
    }
  };

  if (onlyDrafts) {
    return (
      <Button
        onClick={handleCreateNoteDraft}
        size="s"
        variant="ghost"
        className="max-sm:hidden"
        disabled={addMaterials.isPending}
        data-umami-event="material-create-note-draft"
      >
        {addMaterials.isPending ? 'Создание...' : 'Создать заметку'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group bg-background-surface text-s-base hover:text-text-on-accent hover:bg-action-primary-background-default data-[state=open]:text-text-on-accent data-[state=open]:bg-action-primary-background-default border-border-control text-text-primary hover:border-border-control flex h-8 w-[160px] flex-row items-center justify-between gap-2 rounded-lg border px-2 font-medium transition-colors duration-200 max-[550px]:hidden"
        data-umami-event="material-create-note-menu-open"
      >
        <span>Создать заметку</span>

        <ChevronSmallBottom className="group-hover:fill-action-primary-text group-data-[state=open]:fill-action-primary-text fill-icon-primary h-[16px] w-[16px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border-border-default text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_write')}
          className="hover:bg-status-info-background hover:text-text-link py-6 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="read_write"
        >
          Совместная работа
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_only')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="read_only"
        >
          Только репетитор
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('no_access')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="no_access"
        >
          Черновики
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

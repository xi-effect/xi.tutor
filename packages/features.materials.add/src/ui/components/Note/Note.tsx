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

interface NoteProps {
  onlyDrafts?: boolean;
  onCreate?: () => void;
  classroomId?: string;
}

type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

export const Note = ({ onlyDrafts = false, onCreate, classroomId }: NoteProps) => {
  const { t } = useTranslation('materialsAdd');
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
        variant="primary"
        className="text-text-on-accent !h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium max-sm:hidden"
        disabled={addMaterials.isPending}
        data-umami-event="material-create-note-draft"
      >
        <Plus className="fill-text-on-accent size-4 shrink-0" />
        {addMaterials.isPending ? t('note.creating') : t('note.create')}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group bg-background-subtle text-text-primary data-[state=open]:bg-background-surface hover:bg-background-surface flex !h-8 w-auto flex-row items-center justify-between gap-2 rounded-[10px] px-4 font-medium transition-colors duration-200 max-sm:hidden"
        data-umami-event="material-create-note-menu-open"
      >
        <span>{t('note.create')}</span>

        <ChevronSmallBottom className="fill-icon-secondary group-data-[state=open]:fill-icon-primary h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border-border-default text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_write')}
          className="hover:bg-status-info-background hover:text-text-link py-6 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="read_write"
        >
          {t('note.collaborative')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_only')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="read_only"
        >
          {t('note.tutorOnly')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('no_access')}
          className="hover:bg-status-info-background hover:text-text-link hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
          data-umami-event="material-create-note"
          data-umami-event-access-mode="no_access"
        >
          {t('note.drafts')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

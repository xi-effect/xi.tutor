import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';
import { useAddMaterials, useAddClassroomMaterials } from 'common.services';
import { useParams } from '@tanstack/react-router';

interface NoteProps {
  onlyDrafts?: boolean;
  onCreate?: () => void;
  classroomId?: string;
}

type StudentAccessMode = 'no_access' | 'read_only' | 'read_write';

export const Note = ({ onlyDrafts = false, onCreate, classroomId }: NoteProps) => {
  const { classroomId: paramsClassroomId } = useParams({ strict: false });
  const { addMaterials } = useAddMaterials();
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const currentClassroomId = classroomId || paramsClassroomId;

  const handleCreateNoteDraft = () => {
    if (onCreate) {
      onCreate();
    } else {
      addMaterials.mutate({
        content_kind: 'note',
      });
    }
  };

  const handleCreateNoteWithAccess = (studentAccessMode: StudentAccessMode) => {
    if (currentClassroomId) {
      addClassroomMaterials.mutate({
        classroomId: currentClassroomId,
        content_kind: 'note',
        student_access_mode: studentAccessMode,
      });
    }
  };

  if (onlyDrafts) {
    return (
      <Button
        onClick={handleCreateNoteDraft}
        size="s"
        variant="secondary"
        className="max-sm:hidden"
        disabled={addMaterials.isPending}
      >
        {addMaterials.isPending ? 'Создание...' : 'Создать заметку'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group bg-gray-0 text-s-base hover:text-gray-0 hover:bg-brand-80 data-[state=open]:text-gray-0 data-[state=open]:bg-brand-80 border-gray-30 flex h-8 w-[160px] flex-row items-center justify-between gap-2 rounded-lg border px-2 font-medium text-gray-100 transition-colors duration-200 hover:border-gray-50 max-[550px]:hidden">
        <span>Создать заметку</span>

        <ChevronSmallBottom className="group-hover:fill-gray-0 group-data-[state=open]:fill-gray-0 h-[16px] w-[16px] fill-gray-100 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border-gray-10 text-s-base w-[160px] border p-1 font-normal">
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_write')}
          className="hover:bg-brand-0 hover:text-brand-100 py-6 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
        >
          Совместная работа
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('read_only')}
          className="hover:bg-brand-0 hover:text-brand-100 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
        >
          Только репетитор
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleCreateNoteWithAccess('no_access')}
          className="hover:bg-brand-0 hover:text-brand-100 hover:rounded-lg"
          disabled={addClassroomMaterials.isPending}
        >
          Черновики
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

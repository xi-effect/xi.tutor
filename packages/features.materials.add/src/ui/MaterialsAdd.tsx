import { Note, Board } from './components';
import { useAddMaterials, type MaterialsDataT } from 'common.services';
import { materialsSelectors } from '../store/materialsCountStore';

export const MaterialsAdd = ({ onlyDrafts = false }: { onlyDrafts?: boolean }) => {
  const { addMaterials } = useAddMaterials();

  const incrementNotes = materialsSelectors.useIncrementNotes();
  const incrementBoards = materialsSelectors.useIncrementBoards();
  const notesCount = materialsSelectors.useNotesCount();
  const boardsCount = materialsSelectors.useBoardsCount();

  // const { data: user } = useCurrentUser();
  // const isTutor = user?.default_layout === 'tutor';

  const handleCreate = async (kind: MaterialsDataT['content_kind']) => {
    if (kind === 'note') {
      incrementNotes();
      await addMaterials.mutateAsync({ content_kind: kind, name: `Новая заметка ${notesCount}` });
    } else {
      incrementBoards();
      await addMaterials.mutateAsync({ content_kind: kind, name: `Новая доска ${boardsCount}` });
    }
  };

  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      {/* {isTutor && (
        <File
          onUpload={() => {
            console.log('file');
          }}
        />
      )} */}

      <Note onlyDrafts={onlyDrafts} onCreate={() => handleCreate('note')} />

      <Board onlyDrafts={onlyDrafts} onCreate={() => handleCreate('board')} />
    </div>
  );
};

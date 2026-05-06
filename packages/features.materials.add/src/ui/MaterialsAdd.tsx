import { useCreateMaterial } from '../hooks/useCreateMaterial';
import { Note, Board } from './components';

export const MaterialsAdd = ({ onlyDrafts = false }: { onlyDrafts?: boolean }) => {
  const { createMaterial } = useCreateMaterial();

  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      {/* {isTutor && (
        <File
          onUpload={() => {
            console.log('file');
          }}
        />
      )} */}

      <Note onlyDrafts={onlyDrafts} onCreate={() => createMaterial('note')} />

      <Board onlyDrafts={onlyDrafts} onCreate={() => createMaterial('board')} />
    </div>
  );
};

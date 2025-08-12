import { Note, Board } from './components';
import { useAddMaterials, type MaterialsDataT } from 'common.services';

export const MaterialsAdd = () => {
  const { addMaterials } = useAddMaterials();

  // const { data: user } = useCurrentUser();
  // const isTutor = user?.default_layout === 'tutor';

  const handleCreate = async (kind: MaterialsDataT['kind']) => {
    await addMaterials.mutateAsync({ kind });
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

      <Note onCreate={() => handleCreate('note')} />

      <Board onCreate={() => handleCreate('board')} />
    </div>
  );
};

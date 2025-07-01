import { File, Note, Board } from './components';
import { useAddMaterials, type MaterialsDataT } from 'common.services';

export const MaterialsAdd = () => {
  const { addMaterials } = useAddMaterials();

  const handleCreate = async (kind: MaterialsDataT['kind']) => {
    await addMaterials.mutateAsync({ kind });
  };

  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      <File
        onUpload={() => {
          console.log('file');
        }}
      />

      <Note onCreate={() => handleCreate('note')} />

      <Board onCreate={() => handleCreate('board')} />
    </div>
  );
};

import { Note, Board } from './components';
import { useAddMaterials, type MaterialsDataT } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

export const MaterialsAdd = ({ onlyDrafts = false }: { onlyDrafts?: boolean }) => {
  const { addMaterials } = useAddMaterials();
  const navigate = useNavigate();

  // const { data: user } = useCurrentUser();
  // const isTutor = user?.default_layout === 'tutor';

  const handleCreate = (kind: MaterialsDataT['content_kind']) => {
    addMaterials.mutate(
      { content_kind: kind },
      {
        onSuccess: (response) => {
          navigate({
            to: `/materials/${response.data.id}/${response.data.content_kind}`,
          });
        },
      },
    );
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

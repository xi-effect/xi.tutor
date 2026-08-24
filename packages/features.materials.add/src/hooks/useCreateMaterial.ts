import { useNavigate } from '@tanstack/react-router';
import { useAddMaterials } from 'common.services';
import type { MaterialsDataT } from 'common.services';

export const useCreateMaterial = () => {
  const navigate = useNavigate();
  const { addMaterials } = useAddMaterials();

  const createMaterial = (kind: MaterialsDataT['content_kind']) => {
    addMaterials.mutate(
      { content_kind: kind },
      {
        onSuccess: (response) => {
          navigate({
            to:
              kind === 'board' ? '/materials/$materialId/board' : '/materials/$materialId/note',
            params: { materialId: response.data.id },
          });
        },
      },
    );
  };

  return { createMaterial, isPending: addMaterials.isPending };
};

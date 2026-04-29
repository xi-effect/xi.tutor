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
            to: `/materials/${response.data.id}/${response.data.content_kind}`,
          });
        },
      },
    );
  };

  return { createMaterial, isPending: addMaterials.isPending };
};

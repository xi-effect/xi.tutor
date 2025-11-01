import { useSearch } from '@tanstack/react-router';
import { useUpdateClassroomMaterial, useUpdateMaterial } from 'common.services';

export const useMaterialUpdate = () => {
  const { classroom } = useSearch({ strict: false });
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();
  const { updateMaterial } = useUpdateMaterial();

  const isPending = updateClassroomMaterial.isPending || updateMaterial.isPending;

  const update = async (materialId: string, data: { name: string }) => {
    if (classroom) {
      await updateClassroomMaterial.mutateAsync({
        classroomId: classroom,
        id: materialId,
        data: { name: data.name },
      });
    } else {
      await updateMaterial.mutateAsync({
        id: materialId,
        data: { name: data.name },
      });
    }
  };
  return { update, isPending };
};

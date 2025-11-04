import { useParams } from '@tanstack/react-router';
import { useUpdateClassroomMaterial, useUpdateMaterial } from 'common.services';

export const useMaterialUpdate = () => {
  const { classroomId } = useParams({ strict: false });
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();
  const { updateMaterial } = useUpdateMaterial();

  const isPending = updateClassroomMaterial.isPending || updateMaterial.isPending;

  const update = async (materialId: string, data: { name: string }) => {
    if (classroomId) {
      await updateClassroomMaterial.mutateAsync({
        classroomId: classroomId,
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

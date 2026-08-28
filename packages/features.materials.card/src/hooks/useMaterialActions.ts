import {
  useDeleteClassroomMaterials,
  useDeleteMaterials,
  useUpdateClassroomMaterial,
  useUpdateMaterial,
} from 'common.services';
import { AccessModeT, UpdateMaterialDataT } from 'common.types';

export const useMaterialActions = (
  id: string,
  contentKind: string,
  name?: string,
  classroomId?: string,
) => {
  const { deleteMaterials } = useDeleteMaterials();
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();
  const { updateMaterial } = useUpdateMaterial();

  const handleDelete = (options?: { onSuccess?: () => void }) => {
    deleteMaterials.mutate(
      {
        id,
        content_kind: contentKind as 'note' | 'board',
        name,
      },
      { onSuccess: options?.onSuccess },
    );
  };

  const handleDeleteFromClassroom = (options?: { onSuccess?: () => void }) => {
    if (!classroomId) return;

    deleteClassroomMaterials.mutate(
      {
        classroomId,
        id,
        content_kind: contentKind as 'note' | 'board',
        name,
      },
      { onSuccess: options?.onSuccess },
    );
  };

  const handleUpdateAccessMode = (newAccessMode: AccessModeT, currentMode?: AccessModeT) => {
    if (!classroomId || newAccessMode === currentMode) return;

    updateClassroomMaterial.mutate({
      classroomId,
      id,
      data: {
        student_access_mode: newAccessMode,
      },
    });
  };

  const handleUpdateName = (
    type: 'personal' | 'classroom',
    newName: UpdateMaterialDataT['name'],
    onNameUpdated: () => void,
  ) => {
    if (newName === name) return;

    const onSuccess = () => onNameUpdated?.();

    if (type === 'classroom') {
      if (!classroomId) return;

      updateClassroomMaterial.mutate(
        {
          classroomId,
          id,
          data: { name: newName },
        },
        { onSuccess },
      );
      return;
    }

    updateMaterial.mutate(
      {
        id,
        data: { name: newName },
      },
      { onSuccess },
    );
  };

  return {
    handleDelete,
    handleDeleteFromClassroom,
    handleUpdateAccessMode,
    handleUpdateName,
    isDeleting: deleteMaterials.isPending || deleteClassroomMaterials.isPending,
    isUpdating: updateMaterial.isPending || updateClassroomMaterial.isPending,
  };
};

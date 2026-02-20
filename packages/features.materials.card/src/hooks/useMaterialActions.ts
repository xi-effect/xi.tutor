import {
  useDeleteClassroomMaterials,
  useDeleteMaterials,
  useUpdateClassroomMaterial,
  useUpdateMaterial,
} from 'common.services';
import { AccessModeT, UpdateMaterialDataT } from 'common.types';

export const useMaterialActions = (
  id: number,
  contentKind: string,
  name: string,
  classroomId?: string,
) => {
  const { deleteMaterials } = useDeleteMaterials();
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();
  const { updateMaterial } = useUpdateMaterial();

  const handleDelete = () => {
    deleteMaterials.mutate({
      id: id.toString(),
      content_kind: contentKind as 'note' | 'board',
      name,
    });
  };

  const handleDeleteFromClassroom = () => {
    if (!classroomId) return;

    deleteClassroomMaterials.mutate({
      classroomId,
      id: id.toString(),
      content_kind: contentKind as 'note' | 'board',
      name,
    });
  };

  const handleUpdateAccessMode = (newAccessMode: AccessModeT, currentMode?: AccessModeT) => {
    if (!classroomId || newAccessMode === currentMode) return;

    updateClassroomMaterial.mutate({
      classroomId,
      id: id.toString(),
      data: {
        student_access_mode: newAccessMode,
      },
    });
  };

  const handleUpdateName = (
    type: 'tutor' | 'classroom',
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
          id: id.toString(),
          data: { name: newName },
        },
        { onSuccess },
      );
      return;
    }

    updateMaterial.mutate(
      {
        id: id.toString(),
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
  };
};

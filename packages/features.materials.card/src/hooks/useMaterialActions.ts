import {
  useDeleteClassroomMaterials,
  useDeleteMaterials,
  useUpdateClassroomMaterial,
} from 'common.services';
import { AccessModeT } from 'common.types';

export const useMaterialActions = (
  id: number,
  contentKind: string,
  name: string,
  classroomId?: string,
) => {
  const { deleteMaterials } = useDeleteMaterials();
  const { deleteClassroomMaterials } = useDeleteClassroomMaterials();
  const { updateClassroomMaterial } = useUpdateClassroomMaterial();

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

  return {
    handleDelete,
    handleDeleteFromClassroom,
    handleUpdateAccessMode,
  };
};

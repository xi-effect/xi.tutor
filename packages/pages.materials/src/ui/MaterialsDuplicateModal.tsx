import { MaterialsDuplicate } from 'features.materials.duplicate';
import { useMaterialsDuplicate } from '../provider';

export const MaterialsDuplicateModal = () => {
  const { target, open, closeModal } = useMaterialsDuplicate();

  if (!target) {
    return null;
  }

  return (
    <MaterialsDuplicate
      materialId={target.id}
      materialName={target.name}
      contentKind={target.contentKind}
      excludeClassroomId={target.sourceClassroomId}
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeModal();
        }
      }}
    />
  );
};

export type ModalEditClassroomPropsT = {
  open: boolean;
  classroomId: number;
  kind: 'individual' | 'group';
  name?: string;
  onClose: () => void;
};

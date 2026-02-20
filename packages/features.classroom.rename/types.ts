export type ModalEditClassroomPropsT = {
  open: boolean;
  classroomId: number;
  name?: string;
  onClose: () => void;
};

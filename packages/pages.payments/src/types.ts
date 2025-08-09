export type ModalTemplatePropsT = {
  isOpen: boolean;
  onClose: () => void;
  type?: 'add' | 'edit';
};

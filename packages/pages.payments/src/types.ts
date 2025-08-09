export type TemplatePropsT = {
  id: number;
  name: string;
  price: string;
  created_at?: string;
  updated_at?: string;
};

export type ModalTemplatePropsT = {
  isOpen: boolean;
  onClose: () => void;
  type?: 'add' | 'edit';
};

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  created_at: string;
  id: number;
  last_opened_at: string;
  name: string;
  updated_at: string;
  onOpenModal: (id: number) => void;
};

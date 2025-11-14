export type AccessModeT = 'no_access' | 'read_only' | 'read_write';

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  created_at: string;
  id: number;
  last_opened_at: string;
  name: string;
  updated_at: string;
  student_access_mode: AccessModeT;
  onOpenModal: (id: number) => void;
};

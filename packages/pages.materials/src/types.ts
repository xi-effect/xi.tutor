export type MaterialPropsTT = {
  idMaterial: string;
  nameMaterial: string;
  idUser: number;
  nameUser: string;
  roleUser: 'student' | 'teacher';
  updatedAt: string;
};

export type MaterialScopeFilterT = 'personal' | 'classroom' | 'all';

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  id: string;
  last_opened_at?: string;
  name?: string;
  updated_at: string;
  access_kind?: 'personal' | 'classroom';
  classroom_id?: number | null;
  student_access_mode?: 'no_access' | 'read_only' | 'read_write';
};

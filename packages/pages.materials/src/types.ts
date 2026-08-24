export type MaterialPropsTT = {
  idMaterial: string;
  nameMaterial: string;
  idUser: number;
  nameUser: string;
  roleUser: 'student' | 'teacher';
  updatedAt: string;
};

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  id: string;
  last_opened_at?: string;
  name?: string;
  updated_at: string;
};

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
  created_at: string;
  id: number;
  last_opened_at: string;
  name: string;
  updated_at: string;
};

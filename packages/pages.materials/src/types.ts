export type MaterialPropsTT = {
  idMaterial: string;
  nameMaterial: string;
  idUser: number;
  nameUser: string;
  roleUser: 'student' | 'teacher';
  updatedAt: string;
};

export type MaterialPropsT = {
  created_at: string;
  id: number;
  kind: string;
  last_opened_at: string;
  name: string;
  updated_at: string;
};

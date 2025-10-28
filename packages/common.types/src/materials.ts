export type MaterialT = {
  id: number;
  name: string;
  content_kind: 'note' | 'board';
  created_at: string;
  updated_at: string;
  kind: 'tutor' | 'classroom';
};

export type AccessModeT = 'no_access' | 'read_only' | 'read_write';

export type ClassroomMaterialsT = MaterialT & {
  student_access_mode: AccessModeT;
};

export type UpdateMaterialDataT = {
  name?: string;
  kind?: string;
  student_access_mode?: AccessModeT;
};

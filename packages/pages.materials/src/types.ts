import type { FileKind, TagSchema } from 'common.api';

export type MaterialPropsTT = {
  idMaterial: string;
  nameMaterial: string;
  idUser: number;
  nameUser: string;
  roleUser: 'student' | 'teacher';
  updatedAt: string;
};

export type MaterialScopeFilterT = 'personal' | 'classroom' | 'all';

export type MaterialsTabT = 'notes' | 'boards' | 'files';

export type FilesUploaderFilterT = 'mine' | 'students' | 'all';

export type FilesTagOptionT = {
  id: string;
  name: string;
  color?: string;
};

export type FilesFiltersT = {
  search: string;
  uploader: FilesUploaderFilterT;
  kinds: FileKind[];
  tags: FilesTagOptionT[];
};

export const DEFAULT_FILES_FILTERS: FilesFiltersT = {
  search: '',
  uploader: 'mine',
  kinds: [],
  tags: [],
};

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  id: string;
  last_opened_at?: string;
  name?: string;
  updated_at: string;
  access_kind?: 'personal' | 'classroom';
  classroom_id?: number | null;
  student_access_mode?: 'no_access' | 'read_only' | 'read_write';
  tag_ids?: number[] | null;
  tags?: TagSchema[];
};

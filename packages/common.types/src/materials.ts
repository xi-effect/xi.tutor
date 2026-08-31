import { normalizeTagIds, type TagSchema } from 'common.api';

export type MaterialId = string;
export type YDocContentKind = 'note' | 'board';
export type ClassroomContentKind = YDocContentKind | 'file';
export type AccessModeT = 'no_access' | 'read_only' | 'read_write';

export type MaterialCursor = {
  updated_at: string;
};

export type PersonalMaterialScope = {
  access_kind: 'personal';
};

export type ClassroomMaterialScope = {
  access_kind: 'classroom';
  classroom_ids?: number[] | null;
};

export type MaterialScope = PersonalMaterialScope | ClassroomMaterialScope;

export type AnyMaterialFilters = {
  content_kind?: YDocContentKind | null;
  scope?: MaterialScope | null;
  tag_ids?: number[] | null;
};

export type AnyMaterialSearchRequest = {
  cursor?: MaterialCursor | null;
  limit?: number;
  filters: AnyMaterialFilters;
};

export type ClassroomMaterialFilters = {
  content_kind?: YDocContentKind | null;
  tag_ids?: number[] | null;
};

export type ClassroomMaterialSearchRequest = {
  cursor?: MaterialCursor | null;
  limit?: number;
  filters: ClassroomMaterialFilters;
};

export type PersonalMaterialResponse = {
  id: MaterialId;
  updated_at: string;
  content_kind: YDocContentKind;
  name?: string;
  access_kind?: 'personal';
  tag_ids?: number[] | null;
};

export type ClassroomMaterialResponse = {
  id: MaterialId;
  updated_at: string;
  content_kind: ClassroomContentKind;
  name?: string;
  classroom_id?: number | null;
  student_access_mode?: AccessModeT;
  access_kind?: 'classroom';
  file_id?: string;
  tag_ids?: number[] | null;
};

export type MaterialT = PersonalMaterialResponse | ClassroomMaterialResponse;

export type MaterialPropsT = {
  content_kind: YDocContentKind;
  id: MaterialId;
  name?: string;
  updated_at: string;
  student_access_mode?: AccessModeT;
  access_kind?: 'personal' | 'classroom';
  classroom_id?: number | null;
  tag_ids?: number[] | null;
  tags?: TagSchema[];
  onDuplicate?: (id: MaterialId) => void;
  hasIcon?: boolean;
  isLoading?: boolean;
  className?: string;
  last_opened_at?: string;
};

export type MaterialActionsMenuPropsT = {
  isClassroom: boolean;
  isTutor: boolean;
  studentAccessMode?: AccessModeT;
  onDelete: () => void;
  onDeleteFromClassroom: () => void;
  onUpdateAccessMode: (mode: AccessModeT) => void;
  onDuplicate: () => void;
  onEditTags?: () => void;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ModalEditMaterialNamePropsT = {
  isClassroom: boolean;
  isOpen: boolean;
  onClose: () => void;
  name: MaterialPropsT['name'];
  content_kind: MaterialPropsT['content_kind'];
  isLoading?: boolean;
  handleUpdateName: (
    type: 'personal' | 'classroom',
    newName: UpdateMaterialDataT['name'],
    onNameUpdated: () => void,
  ) => void;
};

export type ClassroomMaterialsT = ClassroomMaterialResponse;

export type UpdateMaterialDataT = {
  name?: string;
  student_access_mode?: AccessModeT;
};

export type ContentYDocItem = {
  ydoc_id: string;
  content_token: string;
};

export const PERSONAL_MATERIAL_SCOPE: PersonalMaterialScope = { access_kind: 'personal' };

export function serializeMaterialScope(scope?: MaterialScope | null): string {
  if (scope == null) return 'all';
  if (scope.access_kind === 'personal') return 'personal';
  if (scope.classroom_ids == null) return 'classroom:all';
  return `classroom:${scope.classroom_ids.join(',')}`;
}

export function serializeMaterialTagIds(tagIds?: number[] | null): string {
  return tagIds?.join(',') ?? '';
}

export function getMaterialTagIds(
  material?: {
    tag_ids?: number[] | null;
    tags?: Array<{ id: number }> | null;
  } | null,
): number[] {
  return normalizeTagIds(material?.tag_ids ?? material?.tags?.map((tag) => tag.id) ?? null) ?? [];
}

export function buildAnyMaterialFilters(params: {
  content_kind?: YDocContentKind | null;
  scope?: MaterialScope | null;
  tag_ids?: number[] | null;
}): AnyMaterialFilters {
  return {
    content_kind: params.content_kind ?? null,
    scope: params.scope === undefined ? PERSONAL_MATERIAL_SCOPE : params.scope,
    tag_ids: normalizeTagIds(params.tag_ids),
  };
}

export function buildClassroomMaterialFilters(params: {
  content_kind?: YDocContentKind | null;
  tag_ids?: number[] | null;
}): ClassroomMaterialFilters {
  return {
    content_kind: params.content_kind ?? null,
    tag_ids: normalizeTagIds(params.tag_ids),
  };
}

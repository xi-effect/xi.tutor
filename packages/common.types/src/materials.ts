export type MaterialId = string;
export type YDocContentKind = 'note' | 'board';
export type AccessModeT = 'no_access' | 'read_only' | 'read_write';

export type PersonalMaterialResponse = {
  id: MaterialId;
  updated_at: string;
  content_kind: YDocContentKind;
  name: string;
  access_kind?: 'personal';
};

export type ClassroomMaterialResponse = {
  id: MaterialId;
  updated_at: string;
  content_kind: YDocContentKind;
  name: string;
  student_access_mode?: AccessModeT;
  access_kind?: 'classroom';
};

export type MaterialT = PersonalMaterialResponse | ClassroomMaterialResponse;

export type MaterialPropsT = {
  content_kind: YDocContentKind;
  id: MaterialId;
  name: string;
  updated_at: string;
  student_access_mode?: AccessModeT;
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

/** Storage-item новых personal/classroom materials (content-service). */
export type ContentYDocItem = {
  ydoc_id: string;
  content_token: string;
};

/**
 * Storage-item classroom-service (заметки кабинета).
 * Не использовать для нового Materials API content-service.
 */
export type StorageItemT = {
  access_group_id: string;
  storage_token: string;
  kind: string;
  file_id?: string;
  ydoc_id?: string;
};

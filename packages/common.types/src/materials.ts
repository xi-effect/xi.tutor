export type MaterialT = {
  id: number;
  name: string;
  content_kind: 'note' | 'board';
  created_at: string;
  updated_at: string;
  kind: 'tutor' | 'classroom';
};

export type MaterialPropsT = {
  content_kind: 'note' | 'board';
  created_at: string;
  id: number;
  last_opened_at?: string;
  name: string;
  updated_at: string;
  student_access_mode?: AccessModeT;
  onDuplicate?: (id: number) => void;
  hasIcon?: boolean;
  isLoading?: boolean;
  className?: string;
};

export type AccessModeT = 'no_access' | 'read_only' | 'read_write';

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
    type: MaterialT['kind'],
    newName: UpdateMaterialDataT['name'],
    onNameUpdated: () => void,
  ) => void;
};

export type ClassroomMaterialsT = MaterialT & {
  student_access_mode: AccessModeT;
};

export type UpdateMaterialDataT = {
  name?: string;
  kind?: string;
  student_access_mode?: AccessModeT;
};

export type StorageItemT = {
  access_group_id: string;
  storage_token: string;
  kind: string;
  file_id?: string;
  ydoc_id?: string;
};

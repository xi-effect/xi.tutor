import { AccessModeT } from 'common.types';

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

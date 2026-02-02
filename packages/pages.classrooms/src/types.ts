import { StatusEducationT, TypeEducationT } from 'common.entities';

export type ClassroomPropsT = {
  id: number;
  name: string;
  avatar?: string;
  status: StatusEducationT;
  kind: TypeEducationT;
  description?: string;
  created_at?: string;
  student_id?: number;
  subject_id: number | null;
};

export type SubjectT = 'all' | 'math' | 'computer_science' | 'foreign_languages' | 'other';

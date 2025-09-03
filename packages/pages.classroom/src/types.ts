export type ClassroomPropsT = {
  id: number;
  name: string;
  avatar?: string;
  status: StatusEducationT;
  kind: TypeEducationT;
  description?: string;
  created_at?: string;
  student_id?: number;
};

export type StatusEducationT = 'active' | 'paused' | 'locked' | 'finished';

export type TypeEducationT = 'individual' | 'group';

export type SubjectT = 'all' | 'math' | 'computer_science' | 'foreign_languages' | 'other';

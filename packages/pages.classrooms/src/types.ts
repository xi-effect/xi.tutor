export type ClassroomPropsT = {
  id: number;
  name: string;
  avatar?: string;
  status: StatusEducationT;
  groupSize?: number;
  deleted?: boolean;
};

export type StatusEducationT = 'study' | 'pause' | 'completed' | 'group';

export type TypeEducationT = 'individual' | 'group';

export type SubjectT = 'all' | 'math' | 'computer_science' | 'foreign_languages' | 'other';

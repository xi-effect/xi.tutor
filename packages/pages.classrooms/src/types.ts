export type StudentT = {
  id: string;
  name: string;
  avatar?: string;
  status: StatusEducation | 'group';
  groupSize?: number;
  deleted?: boolean;
};

export type StatusEducation = 'study' | 'pause' | 'completed';

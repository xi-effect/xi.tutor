export type Student = {
  id: string;
  name: string;
  avatar?: string;
  status: 'study' | 'pause' | 'completed' | 'group';
  groupSize?: number;
};

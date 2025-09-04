export type MaterialsKindT = 'note' | 'board';

export type OnboardingStageT =
  | 'user-information'
  | 'default-layout'
  | 'notifications'
  | 'training'
  | 'completed';

export type OnboardingTransitionModeT = 'forwards' | 'backwards';

export type ClassroomStatusT = 'active' | 'paused' | 'locked' | 'finished';

export interface BaseClassroomT {
  id: number;
  status: ClassroomStatusT;
  created_at: string;
  description: string | null;
  name: string;
}

export interface IndividualClassroomT extends BaseClassroomT {
  kind: 'individual';
  student_id: number;
}

export interface GroupClassroomT extends BaseClassroomT {
  kind: 'group';
}

export type ClassroomT = IndividualClassroomT | GroupClassroomT;

export type MaterialsKindT = 'note' | 'board';

export type OnboardingStageT =
  | 'user-information'
  | 'default-layout'
  | 'notifications'
  | 'training'
  | 'completed';

export type OnboardingTransitionModeT = 'forwards' | 'backwards';

export type ClassroomStatusT = 'study' | 'pause' | 'completed';

export interface ClassroomT {
  id: number;
  name: string;
  status: ClassroomStatusT;
  groupSize?: number;
  deleted?: boolean;
}

export type MaterialsKindT = 'note' | 'board';

export type OnboardingStageT =
  | 'user-information'
  | 'default-layout'
  | 'notifications'
  | 'training'
  | 'completed';

export type OnboardingTransitionModeT = 'forwards' | 'backwards';

export type ClassroomStatusT = 'studying' | 'paused' | 'completed';

export interface ClassroomT {
  id: string;
  name: string;
  status: ClassroomStatusT;
}

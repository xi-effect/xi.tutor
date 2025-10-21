export type MaterialsKindT = 'note' | 'board';

export type OnboardingStageT =
  | 'user-information'
  | 'default-layout'
  | 'notifications'
  | 'training'
  | 'completed';

export type OnboardingTransitionModeT = 'forwards' | 'backwards';

export type ClassroomStatusT = 'active' | 'paused' | 'locked' | 'finished';

// Базовые типы для пользователей
export interface UserProfileSchema {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface StudentPreviewSchema {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}

// Типы для связок (tutorship)
export interface TutorshipSchema {
  id: number;
  student: UserProfileSchema;
  status: string;
  created_at: string;
}

// Типы для предметов
export interface SubjectSchema {
  id: number;
  name: string;
  description?: string;
}

// Старые типы для совместимости (используются в списках)
export interface BaseClassroomT {
  id: number;
  status: ClassroomStatusT;
  created_at: string;
  description: string | null;
  name: string;
  subject_id: number | null;
}

export interface IndividualClassroomT extends BaseClassroomT {
  kind: 'individual';
  student_id: number;
}

export interface GroupClassroomT extends BaseClassroomT {
  kind: 'group';
  tutor_id: number;
}

export type ClassroomT = IndividualClassroomT | GroupClassroomT;

// Новые типы для детального получения кабинета
export interface IndividualClassroomTutorResponseSchema {
  id: number;
  kind: 'individual';
  status: ClassroomStatusT;
  created_at: string;
  updated_at: string;
  description: string | null;
  student: UserProfileSchema;
  tutorship: TutorshipSchema;
  subject: SubjectSchema;
  student_id?: number;
  tutor_id?: number;
  subject_id: number | null;
  name?: string;
}

export interface GroupClassroomTutorResponseSchema {
  id: number;
  kind: 'group';
  status: ClassroomStatusT;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  students: StudentPreviewSchema[];
  subject: SubjectSchema;
  tutorships: TutorshipSchema[];
  invite_code: string;
  subject_id: number | null;
  name?: string;
  tutor_id?: number;
  enrollments_count?: number;
}

export type ClassroomTutorResponseSchema =
  | IndividualClassroomTutorResponseSchema
  | GroupClassroomTutorResponseSchema;

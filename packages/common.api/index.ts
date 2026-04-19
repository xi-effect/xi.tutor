export { authApiConfig, AuthQueryKey } from './src/auth';
export { userApiConfig, UserQueryKey } from './src/user';
export { invitationsApiConfig, InvitationsQueryKey } from './src/invitations';
export { paymentTemplatesApiConfig, PaymentTemplatesQueryKey } from './src/paymentTemplates';
export { materialsApiConfig, MaterialsQueryKey } from './src/materials';
export { paymentsApiConfig, PaymentsQueryKey } from './src/payments';
export {
  classroomsApiConfig,
  ClassroomsQueryKey,
  studentsApiConfig,
  StudentsQueryKey,
} from './src/tutor';
export { studentApiConfig, StudentQueryKey } from './src/student';
export { filesApiConfig, FilesQueryKey, getFileUrl } from './src/files';
export { onboardingApiConfig } from './src/onboarding';
export type {
  MaterialsKindT,
  OnboardingStageT,
  OnboardingTransitionModeT,
  ClassroomStatusT,
  ClassroomT,
  IndividualClassroomT,
  GroupClassroomT,
  UserProfileSchema,
  StudentPreviewSchema,
  TutorshipSchema,
  SubjectSchema,
  IndividualClassroomTutorResponseSchema,
  GroupClassroomTutorResponseSchema,
  ClassroomTutorResponseSchema,
  UserRoleT,
} from './src/types';
export { notificationsApiConfig, NotificationsQueryKey } from './src/notifications';
export { telegramConnectionApiConfig, TelegramConnectionQueryKey } from './src/telegramConnection';
export { callsApiConfig, CallsQueryKey } from './src/calls';
export { subjectsApiConfig, SubjectsQueryKey } from './src/subjects';
export { enrollmentsApiConfig, EnrollmentsQueryKey } from './src/enrollments';
export { contactsApiConfig, ContactsQueryKey } from './src/contacts';
export { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey } from './src/classrooms';
export { classroomNotesApiConfig, ClassroomNotesQueryKey } from './src/classrooms';
export { classroomPaymentsApiConfig, ClassroomPaymentsQueryKey } from './src/classrooms';
export {
  schedulerApiConfig,
  SchedulerQueryKey,
  type SchedulerEventDto,
  type OccurrenceModeDto,
  type OccurrenceModeInputDto,
  type SingleOccurrenceModeDto,
  type DailyOccurrenceModeDto,
  type WeeklyOccurrenceModeDto,
  type ExceptionalOccurrenceModeDto,
  type SingleOccurrenceModeInputDto,
  type DailyOccurrenceModeInputDto,
  type WeeklyOccurrenceModeInputDto,
  type EventInstanceDto,
  type GetClassroomScheduleResponseDto,
  type CreateClassroomEventRequestDto,
  type UpdateClassroomEventRequestDto,
} from './src/scheduler';

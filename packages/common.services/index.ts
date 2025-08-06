export { useSignin, useSignup, useSignout, useRequestPasswordReset } from './src/auth';

export {
  useCurrentUser,
  useUpdateProfile,
  useUserById,
  type ProfileData,
  useResetPasswordConfirm,
  type ResetPasswordData,
} from './src/user';

export { useInvitationsList, useAddInvitation, useDeleteInvitation } from './src/invitations';
export {
  useAddMaterials,
  useFetchMaterials,
  useDeleteMaterials,
  useGetMaterial,
  useUpdateMaterial,
  type MaterialsDataT,
} from './src/materials';
export { useFetchClassrooms, useGetClassroom } from './src/classrooms';
export { handleError, showSuccess, type ErrorType } from './src/utils/errorHandler';

export { useOnboardingTransition } from './src/onboarding/useOnboardingTransition';

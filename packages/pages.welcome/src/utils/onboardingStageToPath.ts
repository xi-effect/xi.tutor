import { OnboardingStageT } from 'common.api';

export const onboardingStageToPath: Record<OnboardingStageT, string> = {
  'email-confirmation': '/welcome/email',
  'user-information': '/welcome/user',
  'default-layout': '/welcome/role',
  training: '/',
  completed: '/',
};

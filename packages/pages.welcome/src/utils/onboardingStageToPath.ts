import { OnboardingStageT } from 'common.api';

export const onboardingStageToPath: Record<OnboardingStageT, string> = {
  'email-confirmation': '/welcome/email/confirm',
  'user-information': '/welcome/user',
  'default-layout': '/welcome/role',
  notifications: '/welcome/socials',
  training: '/',
  completed: '/',
};

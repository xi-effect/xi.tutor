import { HttpMethod } from './config';
import { OnboardingStageT, OnboardingTransitionModeT } from './types';

const onboardingApiConfig = {
  ['userOnboarding']: {
    getUrl: (stage: OnboardingStageT, transition: OnboardingTransitionModeT) =>
      `${import.meta.env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/onboarding-stages/${stage}/?transition_mode=${transition}`,
    method: HttpMethod.PUT,
  },
};

export { onboardingApiConfig };

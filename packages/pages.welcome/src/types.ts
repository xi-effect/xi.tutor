// import { UseMutationResult } from '@tanstack/react-query';
// import { AxiosError, AxiosResponse } from 'axios';
// import { SignupData } from 'common.types';

export type WelcomeContextT = {
  id: number | null;
  email: string | null;
  onboarding_stage: 'community-choice' | 'community-create' | 'community-invite' | 'completed';
};

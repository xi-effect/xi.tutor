import { UseMutationResult } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { SignupData } from 'common.types';

export type AuthContextT = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  signup: UseMutationResult<AxiosResponse<SignUpResponse>, AxiosError | Error, SignupData, unknown>;
};

type SignUpResponse = {
  status: number;
  data: {
    id: number;
    email: string;
    email_confirmed: boolean;
    last_password_change: string;
    allowed_confirmation_resend: string;
    onboarding_stage: string;
    username: string;
    display_name: string | null;
    theme: string;
  };
};

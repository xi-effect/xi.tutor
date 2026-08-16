export type MockUser = {
  id: number;
  email: string;
  username: string;
  display_name: string | null;
  language: string;
  onboarding_stage: string;
  default_layout: 'tutor' | 'student' | null;
  email_confirmation_resend_allowed_at?: string | null;
};

export const mockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 1001,
  email: 'e2e@example.com',
  username: 'e2e_user',
  display_name: 'E2E User',
  language: 'ru',
  onboarding_stage: 'completed',
  default_layout: 'tutor',
  email_confirmation_resend_allowed_at: null,
  ...overrides,
});

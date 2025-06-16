export type WelcomeContextT = {
  id: number | null;
  email: string | null;
  onboarding_stage: 'community-choice' | 'community-create' | 'community-invite' | 'completed';
};

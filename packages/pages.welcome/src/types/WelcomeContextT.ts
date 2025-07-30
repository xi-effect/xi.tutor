export type WelcomeContextT = {
  id: number | null;
  email: string | null;
  display_name: string | null;
  onboarding_stage:
    | 'user-information'
    | 'default-layout'
    | 'notifications'
    | 'training'
    | 'completed';
};

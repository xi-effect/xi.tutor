export type WelcomeContextT = {
  id: number | null;
  email: string | null;
  display_name: string | null;
  onboarding_stage:
    | 'email-confirmation'
    | 'user-information'
    | 'default-layout'
    | 'notifications'
    | 'training'
    | 'completed';
};

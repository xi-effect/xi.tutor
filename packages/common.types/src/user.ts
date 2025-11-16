export type RoleT = 'tutor' | 'student';

// Тип для данных пользователя
export type UserData = {
  id: number;
  email: string;
  email_confirmed: boolean;
  last_password_change: string;
  allowed_confirmation_resend: string;
  email_confirmation_resend_allowed_at: string | null;
  onboarding_stage: string;
  username: string;
  display_name: string | null;
  theme: string;
  default_layout: RoleT;
};

// Тип для данных профиля, которые можно обновить
export type ProfileData = {
  username?: string;
  display_name?: string;
  theme?: string;
  default_layout?: RoleT;
  onboarding_stage?: string;
  // Другие поля профиля, которые могут быть обновлены
};

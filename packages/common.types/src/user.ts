// Тип для данных пользователя
export type UserData = {
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

// Тип для данных профиля, которые можно обновить
export type ProfileData = {
  username?: string;
  display_name?: string;
  theme?: string;
  // Другие поля профиля, которые могут быть обновлены
};

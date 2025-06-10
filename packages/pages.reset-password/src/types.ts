export type ResetPasswordRequest = {
  email: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export type NewPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type NewPasswordResponse = {
  success: boolean;
  message: string;
};

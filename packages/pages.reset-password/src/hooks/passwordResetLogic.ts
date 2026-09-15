import { AxiosError } from 'axios';
import { typeResponseRequest } from '../types';

/** И вход, и сброс пароля могут отдать «нет пользователя» как 404 или 401 User not found. */
export function isPasswordResetUserNotFound(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (status === typeResponseRequest.UserNotFound) {
      return true;
    }

    return status === 401 && detail === 'User not found';
  }

  return error instanceof Error && error.message === 'Email not found';
}

// features/auth/api/signIn.ts
import { FormData } from '../model/formSchema';
import { SignInResponse } from './types';

export async function postSignin(data: FormData): Promise<SignInResponse> {
  console.log('data', data);
  // Здесь нужно реализовать настоящий API-запрос.
  // Для примера возвращаем успешный ответ с задержкой:
  return new Promise((resolve) => setTimeout(() => resolve({ status: 200, theme: null }), 1000));
}

import { useSearch } from '@tanstack/react-router';

/** Экран «письмо отправлено». Ссылка из письма приходит с другим token. */
export function isEmailWaitingScreen(token: string | undefined): boolean {
  return token === undefined || token === 'confirm';
}

/** Токен из query-параметра (?token=) */
export function useEmailToken(): string | undefined {
  const search = useSearch({ strict: false }) as { token?: string } | undefined;
  return search?.token;
}

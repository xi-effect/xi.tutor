import { useSearch } from '@tanstack/react-router';

/** Токен из query-параметра (?token=) */
export function useConfirmEmailToken(): string | undefined {
  const search = useSearch({ strict: false }) as { token?: string } | undefined;
  return search?.token;
}

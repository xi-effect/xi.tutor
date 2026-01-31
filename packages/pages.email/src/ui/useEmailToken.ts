import { useParams, useSearch } from '@tanstack/react-router';

/** Токен/emailId из path-параметра ($emailId) или из query (?token=) */
export function useEmailToken(): string | undefined {
  const { emailId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { token?: string } | undefined;
  return emailId ?? search?.token;
}
